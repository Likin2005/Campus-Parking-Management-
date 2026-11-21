from typing import List, Optional
from app.config import settings
from app.database import db_client
from app.models.zone import ZoneDocument


class ZoneRepository:
    def __init__(self):
        self.db = settings.DB_ZONES

    async def get_all(self) -> List[ZoneDocument]:
        docs = await db_client.find(self.db, selector={"type": "zone"})
        # Sort by zone code
        zones = [ZoneDocument(**d) for d in docs]
        zones.sort(key=lambda z: z.code)
        return zones

    async def get_by_id(self, zone_id: str) -> Optional[ZoneDocument]:
        doc = await db_client.get_document(self.db, zone_id)
        if doc and doc.get("type") == "zone":
            return ZoneDocument(**doc)
        return None

    async def get_by_code(self, code: str) -> Optional[ZoneDocument]:
        normalized = code.strip().upper()
        docs = await db_client.find(
            self.db,
            selector={"type": "zone", "code": normalized},
            limit=1,
        )
        if docs:
            return ZoneDocument(**docs[0])
        return None

    async def save(self, zone: ZoneDocument) -> ZoneDocument:
        doc_dict = zone.model_dump(by_alias=True, exclude_none=True)
        saved = await db_client.save_document(self.db, doc_dict)
        return ZoneDocument(**saved)

    async def delete(self, zone_id: str, rev: str) -> bool:
        return await db_client.delete_document(self.db, zone_id, rev)


zone_repo = ZoneRepository()
