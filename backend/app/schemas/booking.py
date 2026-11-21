from typing import Optional
from pydantic import BaseModel, Field, model_validator


class BookingCreateRequest(BaseModel):
    zoneId: Optional[str] = None
    zoneCode: Optional[str] = None
    slotId: str
    date: str  # YYYY-MM-DD
    startTime: str  # HH:MM
    endTime: str  # HH:MM
    licensePlate: Optional[str] = None
    vehiclePlate: Optional[str] = None
    vehicleModel: Optional[str] = "Registered Vehicle"

    @model_validator(mode="before")
    @classmethod
    def reconcile_aliases(cls, values):
        if isinstance(values, dict):
            # Reconcile zoneId / zoneCode
            if not values.get("zoneId"):
                if values.get("zoneCode"):
                    zc = values.get("zoneCode").lower()
                    values["zoneId"] = f"zone-{zc}" if not zc.startswith("zone-") else zc
                else:
                    values["zoneId"] = "zone-a"
            # Reconcile licensePlate / vehiclePlate
            if not values.get("licensePlate") and values.get("vehiclePlate"):
                values["licensePlate"] = values.get("vehiclePlate")
            if not values.get("licensePlate"):
                values["licensePlate"] = "ABC-1234"
        return values


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = "User requested cancellation"


class BookingResponse(BaseModel):
    id: str
    userId: str
    userName: str
    userRole: str
    zoneId: str
    zoneName: str
    slotId: str
    slotNumber: str
    slotType: str
    licensePlate: str
    vehicleModel: str
    startIso: str
    endIso: str
    status: str  # upcoming, completed, cancelled
    permitUsed: str
    rateCharged: float
    createdAt: str
    updatedAt: Optional[str] = None
    cancelledAt: Optional[str] = None
    cancelReason: Optional[str] = None

    class Config:
        populate_by_name = True
