from typing import Optional
from pydantic import Field
from app.models.common import CouchDBBaseModel, utc_now_iso


class BookingDocument(CouchDBBaseModel):
    type: str = "booking"
    userId: str
    userName: str
    userRole: str
    zoneId: str
    zoneName: str
    slotId: str
    slotNumber: str
    slotType: str = "Standard"
    licensePlate: str
    vehicleModel: str = "Registered Vehicle"
    startIso: str
    endIso: str
    status: str = "upcoming"  # upcoming, completed, cancelled
    permitUsed: str = "Campus Permit"
    rateCharged: float = 0.0
    createdAt: str = Field(default_factory=utc_now_iso)
    updatedAt: Optional[str] = Field(default_factory=utc_now_iso)
    cancelledAt: Optional[str] = None
    cancelReason: Optional[str] = None
