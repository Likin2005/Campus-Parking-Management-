from typing import Optional
from pydantic import Field
from app.models.common import CouchDBBaseModel, utc_now_iso


class InboxItemDocument(CouchDBBaseModel):
    type: str = "inbox_item"
    user: str
    zone: str
    slot: str
    issue: str
    severity: str = "Medium"  # Low, Medium, High
    status: str = "Pending"  # Pending, Resolved
    date: str = "Today"
    createdAt: str = Field(default_factory=utc_now_iso)
    resolvedAt: Optional[str] = None
