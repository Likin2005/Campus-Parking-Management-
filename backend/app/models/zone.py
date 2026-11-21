from typing import List, Optional
from pydantic import Field
from app.models.common import CouchDBBaseModel, utc_now_iso
from app.models.slot import Slot


class ZoneDocument(CouchDBBaseModel):
    type: str = "zone"
    code: str  # A, B, C, etc.
    name: str
    tagline: str = ""
    typeOfParking: str = Field("Surface Lot", alias="type")  # Covered Deck, Surface Lot, Underground
    isCovered: bool = False
    hasEv: bool = False
    hasAccessible: bool = True
    distanceMinutes: int = 3
    hourlyRate: float = 2.0
    ratesInfo: str = "Standard permits accepted"
    landmark: str = "Campus Grounds"
    slots: List[Slot] = Field(default_factory=list)
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)

    class Config:
        populate_by_name = True
