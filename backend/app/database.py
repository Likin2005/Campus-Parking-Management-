import logging
from typing import Any, Dict, List, Optional
import httpx
from app.config import settings
from app.core.exceptions import (
    DatabaseConnectionError,
    DocumentConflictError,
    DocumentNotFoundError,
)

logger = logging.getLogger("campuspark.database")


class CouchDBClient:
    """
    High-performance asynchronous CouchDB client.
    Handles JSON document persistence, optimistic concurrency control (_rev),
    Mango queries, and index creation for the NoSQL parking management system.
    """

    def __init__(self):
        self.base_url = settings.COUCHDB_URL.rstrip("/")
        self.auth = (settings.COUCHDB_USERNAME, settings.COUCHDB_PASSWORD)
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    async def close(self) -> None:
        """Close database connection pool if any."""
        pass

    def _get_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.base_url,
            auth=self.auth,
            timeout=self.timeout,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
        )

    async def check_connection(self) -> Dict[str, Any]:
        """Verify CouchDB connection and return server metadata."""
        try:
            async with self._get_client() as client:
                res = await client.get("/")
                if res.status_code == 200:
                    return res.json()
                elif res.status_code == 401:
                    raise DatabaseConnectionError("CouchDB authentication failed. Check credentials.")
                else:
                    raise DatabaseConnectionError(f"CouchDB returned status {res.status_code}: {res.text}")
        except httpx.RequestError as exc:
            raise DatabaseConnectionError(f"Cannot reach CouchDB at {self.base_url}: {exc}")

    async def get_all_dbs(self) -> List[str]:
        """Return list of all existing CouchDB database names."""
        async with self._get_client() as client:
            res = await client.get("/_all_dbs")
            if res.status_code == 200:
                return res.json()
            raise DatabaseConnectionError(f"Failed to list databases: {res.text}")

    async def ensure_database(self, db_name: str) -> bool:
        """Create database if it does not already exist."""
        async with self._get_client() as client:
            res = await client.get(f"/{db_name}")
            if res.status_code == 200:
                return False  # Already exists
            if res.status_code == 404:
                create_res = await client.put(f"/{db_name}")
                if create_res.status_code in (201, 202):
                    logger.info(f"Created CouchDB database: {db_name}")
                    return True
                raise DatabaseConnectionError(f"Failed to create database '{db_name}': {create_res.text}")
            raise DatabaseConnectionError(f"Error checking database '{db_name}': {res.text}")

    async def create_index(
        self, db_name: str, fields: List[str], name: Optional[str] = None, ddoc: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a Mango index for query optimization."""
        payload: Dict[str, Any] = {"index": {"fields": fields}}
        if name:
            payload["name"] = name
        if ddoc:
            payload["ddoc"] = ddoc

        async with self._get_client() as client:
            res = await client.post(f"/{db_name}/_index", json=payload)
            if res.status_code in (200, 201):
                logger.info(f"Created index '{name or fields}' on '{db_name}'")
                return res.json()
            raise DatabaseConnectionError(f"Failed to create index on '{db_name}': {res.text}")

    async def get_document(self, db_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve document by _id from specified database."""
        async with self._get_client() as client:
            res = await client.get(f"/{db_name}/{doc_id}")
            if res.status_code == 200:
                return res.json()
            if res.status_code == 404:
                return None
            raise DatabaseConnectionError(f"Error reading doc '{doc_id}' from '{db_name}': {res.text}")

    async def save_document(self, db_name: str, doc: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or update a document in CouchDB.
        If _id is present: uses PUT /{db}/{doc_id}.
        If no _id: uses POST /{db}.
        """
        doc_id = doc.get("_id")
        async with self._get_client() as client:
            if doc_id:
                res = await client.put(f"/{db_name}/{doc_id}", json=doc)
            else:
                res = await client.post(f"/{db_name}", json=doc)

            if res.status_code in (200, 201, 202):
                data = res.json()
                doc["_id"] = data.get("id", doc_id)
                doc["_rev"] = data.get("rev")
                return doc
            elif res.status_code == 409:
                raise DocumentConflictError(
                    f"CouchDB DocumentConflictError (409): Document '{doc_id}' revision mismatch."
                )
            elif res.status_code == 404:
                raise DocumentNotFoundError(f"Database or document not found: {res.text}")
            else:
                raise DatabaseConnectionError(f"Failed to save document in '{db_name}': {res.text}")

    async def delete_document(self, db_name: str, doc_id: str, rev: str) -> bool:
        """Delete a document by _id and _rev."""
        async with self._get_client() as client:
            res = await client.delete(f"/{db_name}/{doc_id}?rev={rev}")
            if res.status_code in (200, 202):
                return True
            if res.status_code == 404:
                return False
            if res.status_code == 409:
                raise DocumentConflictError(f"Conflict deleting doc '{doc_id}' with rev '{rev}'.")
            raise DatabaseConnectionError(f"Failed to delete doc '{doc_id}': {res.text}")

    async def find(
        self,
        db_name: str,
        selector: Dict[str, Any],
        sort: Optional[List[Any]] = None,
        limit: Optional[int] = None,
        skip: Optional[int] = None,
        fields: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Execute a CouchDB Mango query (_find).
        Demonstrates NoSQL declarative JSON selector queries.
        """
        query: Dict[str, Any] = {"selector": selector}
        if sort:
            query["sort"] = sort
        if limit is not None:
            query["limit"] = limit
        if skip is not None:
            query["skip"] = skip
        if fields:
            query["fields"] = fields

        async with self._get_client() as client:
            res = await client.post(f"/{db_name}/_find", json=query)
            if res.status_code == 200:
                return res.json().get("docs", [])
            raise DatabaseConnectionError(f"Mango query failed on '{db_name}': {res.text}")

    async def get_all_docs(self, db_name: str, include_docs: bool = True) -> List[Dict[str, Any]]:
        """Retrieve all documents from a database."""
        params = {"include_docs": "true" if include_docs else "false"}
        async with self._get_client() as client:
            res = await client.get(f"/{db_name}/_all_docs", params=params)
            if res.status_code == 200:
                rows = res.json().get("rows", [])
                if include_docs:
                    return [r["doc"] for r in rows if "doc" in r and not r["id"].startswith("_design/")]
                return rows
            raise DatabaseConnectionError(f"Failed to fetch _all_docs for '{db_name}': {res.text}")

    async def bulk_docs(self, db_name: str, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Insert or update multiple documents in a single bulk request."""
        async with self._get_client() as client:
            res = await client.post(f"/{db_name}/_bulk_docs", json={"docs": docs})
            if res.status_code in (200, 201, 202):
                return res.json()
            raise DatabaseConnectionError(f"Bulk docs failed on '{db_name}': {res.text}")


# Global database client singleton
db_client = CouchDBClient()
