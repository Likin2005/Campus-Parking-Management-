from typing import Optional
from pydantic import Field
from app.models.common import CouchDBBaseModel, utc_now_iso


class BookingLockDocument(CouchDBBaseModel):
    """
    CouchDB coordination document for atomic slot reservation.
    Leverages CouchDB's single-document _rev compare-and-swap mechanism
    to prevent race conditions and guarantee zero double-bookings.
    """
    type: str = "booking_lock"
    slotId: str
    lockedBy: str
    expiresAt: str
    createdAt: str = Field(default_factory=utc_now_iso)
