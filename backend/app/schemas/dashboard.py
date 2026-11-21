from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class HourlyTrendPoint(BaseModel):
    hour: str
    pct: int


class DashboardStatsResponse(BaseModel):
    totalZones: int
    totalSlots: int
    totalAvailable: int
    totalOccupied: int
    totalReserved: int
    totalDisabled: int
    totalEv: int
    occupancyRate: int
    hourlyData: List[HourlyTrendPoint]


class InboxItemResponse(BaseModel):
    id: str
    user: str
    zone: str
    slot: str
    issue: str
    severity: str
    status: str
    date: str
    createdAt: str
    resolvedAt: Optional[str] = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[Any] = None
