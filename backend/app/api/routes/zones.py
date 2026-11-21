from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.dependencies import require_admin
from app.models.user import UserDocument
from app.schemas.dashboard import MessageResponse
from app.schemas.slot import SlotCreateRequest, SlotResponse, SlotStatusUpdateRequest
from app.schemas.zone import ZoneCreateRequest, ZoneResponse, ZoneUpdateRequest
from app.services.slot_service import slot_service
from app.services.zone_service import zone_service

router = APIRouter(prefix="/zones", tags=["Parking Zones & Slots"])


@router.get("", response_model=List[ZoneResponse])
async def get_all_zones(
    isCovered: Optional[bool] = Query(None),
    hasEv: Optional[bool] = Query(None),
    hasAccessible: Optional[bool] = Query(None),
):
    """Retrieve all campus parking zones with real-time simulated slot availability."""
    zones = await zone_service.get_all_zones()
    if isCovered is not None:
        zones = [z for z in zones if z.isCovered == isCovered]
    if hasEv is not None:
        zones = [z for z in zones if z.hasEv == hasEv]
    if hasAccessible is not None:
        zones = [z for z in zones if z.hasAccessible == hasAccessible]
    return zones


@router.get("/{zone_id}", response_model=ZoneResponse)
async def get_zone(zone_id: str):
    """Get detailed information for a specific parking zone."""
    return await zone_service.get_zone_by_id(zone_id)


@router.post("", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(
    req: ZoneCreateRequest, current_admin: UserDocument = Depends(require_admin)
):
    """Create a new campus parking facility (Admin only)."""
    return await zone_service.create_zone(req)


@router.put("/{zone_id}", response_model=ZoneResponse)
async def update_zone(
    zone_id: str,
    req: ZoneUpdateRequest,
    current_admin: UserDocument = Depends(require_admin),
):
    """Update zone properties and operational details (Admin only)."""
    return await zone_service.update_zone(zone_id, req)


@router.delete("/{zone_id}", response_model=MessageResponse)
async def delete_zone(
    zone_id: str, current_admin: UserDocument = Depends(require_admin)
):
    """Remove a parking zone (Admin only)."""
    await zone_service.delete_zone(zone_id)
    return MessageResponse(message=f"Zone '{zone_id}' successfully removed.")


# Slot sub-routes under zones
@router.get("/{zone_id}/slots", response_model=List[SlotResponse])
async def get_zone_slots(zone_id: str):
    """Retrieve all slots inside a zone."""
    return await slot_service.get_slots_by_zone(zone_id)


@router.post("/{zone_id}/slots", response_model=SlotResponse, status_code=status.HTTP_201_CREATED)
async def add_slot_to_zone(
    zone_id: str,
    req: SlotCreateRequest,
    current_admin: UserDocument = Depends(require_admin),
):
    """Add a new slot to a zone (Admin only)."""
    return await slot_service.add_slot(zone_id, req)


@router.patch("/{zone_id}/slots/{slot_id}/status", response_model=SlotResponse)
async def update_slot_status(
    zone_id: str,
    slot_id: str,
    req: SlotStatusUpdateRequest,
    current_admin: UserDocument = Depends(require_admin),
):
    """Admin override to update slot status (available, occupied, maintenance)."""
    return await slot_service.update_slot_status(zone_id, slot_id, req)
