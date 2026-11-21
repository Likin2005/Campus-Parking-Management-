from typing import Optional
from pydantic import BaseModel, Field


class Slot(BaseModel):
    id: str
    number: str
    zoneCode: str
    type: str = "Standard"  # Standard, EV Charging, Accessible, Compact, Motorcycle
    status: str = "available"  # available, occupied, reserved, disabled
    level: int = 1
    pricePerHour: float = 2.0
    notes: str = ""
