from typing import List, Optional
from app.config import settings
from app.database import db_client
from app.models.common import utc_now_iso
from app.models.inbox import InboxItemDocument


class InboxRepository:
    def __init__(self):
        self.db = settings.DB_INBOX

    async def get_all(self) -> List[InboxItemDocument]:
        docs = await db_client.find(self.db, selector={"type": "inbox_item"})
        items = [InboxItemDocument(**d) for d in docs]
        items.sort(key=lambda i: i.createdAt, reverse=True)
        return items

    async def get_by_id(self, item_id: str) -> Optional[InboxItemDocument]:
        doc = await db_client.get_document(self.db, item_id)
        if doc and doc.get("type") == "inbox_item":
            return InboxItemDocument(**doc)
        return None

    async def save(self, item: InboxItemDocument) -> InboxItemDocument:
        doc_dict = item.model_dump(by_alias=True, exclude_none=True)
        saved = await db_client.save_document(self.db, doc_dict)
        return InboxItemDocument(**saved)

    async def resolve(self, item_id: str) -> Optional[InboxItemDocument]:
        item = await self.get_by_id(item_id)
        if not item:
            return None
        item.status = "Resolved"
        item.resolvedAt = utc_now_iso()
        return await self.save(item)


inbox_repo = InboxRepository()
