import logging
from typing import List, Optional
from app.core.exceptions import DocumentNotFoundError, ValidationError
from app.models.common import utc_now_iso
from app.models.slot import Slot
from app.repositories.zone_repository import zone_repo
from app.schemas.slot import SlotCreateRequest, SlotResponse, SlotStatusUpdateRequest

logger = logging.getLogger("campuspark.slot_service")


class SlotService:
    async def get_slots_by_zone(self, zone_id: str) -> List[SlotResponse]:
        zone = await zone_repo.get_by_id(zone_id)
        if not zone:
            # Try by code if not found by id
            zone = await zone_repo.get_by_code(zone_id.replace("zone-", ""))
        if not zone:
            raise DocumentNotFoundError(f"Zone '{zone_id}' not found.")

        return [
            SlotResponse(
                id=s.id,
                number=s.number,
                zoneCode=s.zoneCode,
                type=s.type,
                status=s.status,
                level=s.level,
                pricePerHour=s.pricePerHour,
                notes=s.notes,
            )
            for s in zone.slots
        ]

    async def add_slot(self, zone_id: str, req: SlotCreateRequest) -> SlotResponse:
        zone = await zone_repo.get_by_id(zone_id)
        if not zone:
            zone = await zone_repo.get_by_code(zone_id.replace("zone-", ""))
        if not zone:
            raise DocumentNotFoundError(f"Zone '{zone_id}' not found.")

        code = zone.code
        next_num = len(zone.slots) + 1
        slot_id = req.id or f"{code}-{str(next_num).zfill(2)}"
        slot_number = req.number or slot_id

        # Verify uniqueness within zone
        if any(s.id == slot_id for s in zone.slots):
            raise ValidationError(f"Slot ID '{slot_id}' already exists in zone {code}.")

        new_slot = Slot(
            id=slot_id,
            number=slot_number,
            zoneCode=code,
            type=req.type or "Standard",
            status="available",
            level=req.level or 1,
            pricePerHour=req.pricePerHour or zone.hourlyRate or 2.0,
            notes=req.notes or "",
        )

        zone.slots.append(new_slot)
        zone.updated_at = utc_now_iso()
        await zone_repo.save(zone)
        logger.info(f"Added slot '{slot_id}' to zone '{zone.code}'")

        return SlotResponse(
            id=new_slot.id,
            number=new_slot.number,
            zoneCode=new_slot.zoneCode,
            type=new_slot.type,
            status=new_slot.status,
            level=new_slot.level,
            pricePerHour=new_slot.pricePerHour,
            notes=new_slot.notes,
        )

    async def update_slot_status(
        self, zone_id: str, slot_id: str, req: SlotStatusUpdateRequest
    ) -> SlotResponse:
        zone = await zone_repo.get_by_id(zone_id)
        if not zone:
            zone = await zone_repo.get_by_code(zone_id.replace("zone-", ""))
        if not zone:
            raise DocumentNotFoundError(f"Zone '{zone_id}' not found.")

        target_slot: Optional[Slot] = None
        for s in zone.slots:
            if s.id == slot_id:
                target_slot = s
                break

        if not target_slot:
            raise DocumentNotFoundError(f"Slot '{slot_id}' not found in zone '{zone.code}'.")

        target_slot.status = req.status
        if req.status == "disabled":
            target_slot.notes = req.notes or "Disabled by Admin for Maintenance"
        elif req.notes is not None:
            target_slot.notes = req.notes

        zone.updated_at = utc_now_iso()
        await zone_repo.save(zone)
        logger.info(f"Updated slot '{slot_id}' status to '{req.status}'")

        return SlotResponse(
            id=target_slot.id,
            number=target_slot.number,
            zoneCode=target_slot.zoneCode,
            type=target_slot.type,
            status=target_slot.status,
            level=target_slot.level,
            pricePerHour=target_slot.pricePerHour,
            notes=target_slot.notes,
        )


slot_service = SlotService()
