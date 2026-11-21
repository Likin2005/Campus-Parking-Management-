from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


def utc_now_iso() -> str:
    """Return current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()


class CouchDBBaseModel(BaseModel):
    """Base schema for CouchDB documents handling _id and _rev."""
    id: Optional[str] = Field(None, alias="_id")
    rev: Optional[str] = Field(None, alias="_rev")
    type: str

    class Config:
        populate_by_name = True
