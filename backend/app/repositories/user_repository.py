from typing import List, Optional
from app.config import settings
from app.database import db_client
from app.models.user import UserDocument


class UserRepository:
    def __init__(self):
        self.db = settings.DB_USERS

    async def get_by_id(self, user_id: str) -> Optional[UserDocument]:
        doc = await db_client.get_document(self.db, user_id)
        if doc and doc.get("type") == "user":
            return UserDocument(**doc)
        return None

    async def get_by_email(self, email: str) -> Optional[UserDocument]:
        normalized = email.strip().lower()
        docs = await db_client.find(
            self.db,
            selector={"type": "user", "email": normalized},
            limit=1,
        )
        if docs:
            return UserDocument(**docs[0])
        return None

    async def save(self, user: UserDocument) -> UserDocument:
        doc_dict = user.model_dump(by_alias=True, exclude_none=True)
        saved = await db_client.save_document(self.db, doc_dict)
        return UserDocument(**saved)

    async def get_all(self) -> List[UserDocument]:
        docs = await db_client.find(self.db, selector={"type": "user"})
        return [UserDocument(**d) for d in docs]


user_repo = UserRepository()
