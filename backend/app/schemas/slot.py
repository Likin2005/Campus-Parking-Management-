from typing import Optional
from pydantic import BaseModel, Field


class SlotResponse(BaseModel):
    id: str
    number: str
    zoneCode: str
    type: str = "Standard"
    status: str = "available"  # available, occupied, reserved, disabled
    level: int = 1
    pricePerHour: float = 2.0
    notes: str = ""


class SlotCreateRequest(BaseModel):
    type: str = "Standard"
    level: int = 1
    pricePerHour: float = 2.0
    notes: str = ""
    id: Optional[str] = None
    number: Optional[str] = None


class SlotStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(available|occupied|reserved|disabled)$")
    notes: Optional[str] = None
