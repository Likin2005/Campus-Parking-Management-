from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.slot import SlotResponse


class ZoneResponse(BaseModel):
    id: str
    code: str
    name: str
    tagline: str = ""
    type: str = "Surface Lot"
    isCovered: bool = False
    hasEv: bool = False
    hasAccessible: bool = True
    distanceMinutes: int = 3
    hourlyRate: float = 2.0
    ratesInfo: str = "Standard permits accepted"
    landmark: str = "Campus Grounds"
    slots: List[SlotResponse] = Field(default_factory=list)

    class Config:
        populate_by_name = True


class ZoneCreateRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=4)
    name: str = Field(..., min_length=2)
    tagline: Optional[str] = "Newly added campus parking lot"
    type: Optional[str] = "Surface Lot"
    slotCount: Optional[int] = 16
    hourlyRate: Optional[float] = 2.0
    ratesInfo: Optional[str] = "Standard permits apply"
    landmark: Optional[str] = "Campus East Wing"
    isCovered: Optional[bool] = False
    hasEv: Optional[bool] = False
    distanceMinutes: Optional[int] = 5


class ZoneUpdateRequest(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    type: Optional[str] = None
    isCovered: Optional[bool] = None
    hasEv: Optional[bool] = None
    hasAccessible: Optional[bool] = None
    distanceMinutes: Optional[int] = None
    hourlyRate: Optional[float] = None
    ratesInfo: Optional[str] = None
    landmark: Optional[str] = None
