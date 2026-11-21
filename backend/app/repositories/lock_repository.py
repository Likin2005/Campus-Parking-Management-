import asyncio
from datetime import datetime, timedelta, timezone
import logging
from typing import Optional
from app.config import settings
from app.core.exceptions import BookingConflictError, DocumentConflictError
from app.database import db_client
from app.models.common import utc_now_iso

logger = logging.getLogger("campuspark.lock")


class LockRepository:
    """
    CouchDB-backed distributed slot lease coordinator.
    Demonstrates NoSQL Optimistic Concurrency Control (OCC) and
    atomic Compare-And-Swap (CAS) via document _rev versioning.
    """

    def __init__(self):
        self.db = settings.DB_LOCKS

    async def acquire_lock(
        self,
        slot_id: str,
        locked_by: str,
        ttl_seconds: int = 8,
        max_retries: int = 6,
        retry_delay_seconds: float = 0.1,
    ) -> str:
        """
        Acquire an exclusive lease on slot_id using CouchDB atomic document updates.
        Returns the lock revision string.
        """
        doc_id = f"lock_slot_{slot_id}"

        for attempt in range(max_retries):
            now = datetime.now(timezone.utc)
            expires = (now + timedelta(seconds=ttl_seconds)).isoformat()

            existing = await db_client.get_document(self.db, doc_id)

            if not existing:
                # Attempt to create new lock document
                new_doc = {
                    "_id": doc_id,
                    "type": "booking_lock",
                    "slotId": slot_id,
                    "lockedBy": locked_by,
                    "expiresAt": expires,
                    "createdAt": utc_now_iso(),
                }
                try:
                    saved = await db_client.save_document(self.db, new_doc)
                    logger.info(f"Lock acquired for slot '{slot_id}' by '{locked_by}'")
                    return saved["_rev"]
                except DocumentConflictError:
                    # Lost race to another concurrent request
                    await asyncio.sleep(retry_delay_seconds)
                    continue

            # Lock document already exists: inspect expiration
            exp_str = existing.get("expiresAt", "")
            try:
                exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                is_expired = exp_dt < now
            except Exception:
                is_expired = True

            if is_expired:
                # Steal stale lock using CAS update with current _rev
                existing["lockedBy"] = locked_by
                existing["expiresAt"] = expires
                existing["updatedAt"] = utc_now_iso()
                try:
                    saved = await db_client.save_document(self.db, existing)
                    logger.info(f"Stale lock acquired for slot '{slot_id}' by '{locked_by}'")
                    return saved["_rev"]
                except DocumentConflictError:
                    # Concurrent contender beat us to updating the stale lock
                    await asyncio.sleep(retry_delay_seconds)
                    continue
            else:
                # Active lock held by someone else, wait and retry
                await asyncio.sleep(retry_delay_seconds)

        raise BookingConflictError(
            f"Slot '{slot_id}' is currently being reserved by another session. Please try again in a few moments."
        )

    async def release_lock(self, slot_id: str, locked_by: str) -> None:
        """Release the acquired slot lock cleanly."""
        doc_id = f"lock_slot_{slot_id}"
        try:
            existing = await db_client.get_document(self.db, doc_id)
            if existing and existing.get("lockedBy") == locked_by:
                rev = existing.get("_rev")
                if rev:
                    await db_client.delete_document(self.db, doc_id, rev)
                    logger.info(f"Lock released for slot '{slot_id}' by '{locked_by}'")
        except Exception as exc:
            logger.warning(f"Failed to release lock '{doc_id}': {exc}")


class SlotLockContext:
    """Async context manager wrapper for slot locking."""
    def __init__(self, slot_id: str, locked_by: str):
        self.slot_id = slot_id
        self.locked_by = locked_by
        self.repo = LockRepository()

    async def __aenter__(self):
        await self.repo.acquire_lock(self.slot_id, self.locked_by)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.repo.release_lock(self.slot_id, self.locked_by)


lock_repo = LockRepository()
