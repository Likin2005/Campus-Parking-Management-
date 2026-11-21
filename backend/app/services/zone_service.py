import logging
from typing import List, Optional
from app.core.exceptions import DocumentConflictError, DocumentNotFoundError, ValidationError
from app.models.common import utc_now_iso
from app.models.slot import Slot
from app.models.zone import ZoneDocument
from app.repositories.booking_repository import booking_repo
from app.repositories.zone_repository import zone_repo
from app.schemas.slot import SlotResponse
from app.schemas.zone import ZoneCreateRequest, ZoneResponse, ZoneUpdateRequest

logger = logging.getLogger("campuspark.zone_service")


def format_zone_response(zone: ZoneDocument) -> ZoneResponse:
    return ZoneResponse(
        id=zone.id or "",
        code=zone.code,
        name=zone.name,
        tagline=zone.tagline,
        type=zone.typeOfParking,
        isCovered=zone.isCovered,
        hasEv=zone.hasEv,
        hasAccessible=zone.hasAccessible,
        distanceMinutes=zone.distanceMinutes,
        hourlyRate=zone.hourlyRate,
        ratesInfo=zone.ratesInfo,
        landmark=zone.landmark,
        slots=[
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
        ],
    )


class ZoneService:
    async def get_all_zones(self) -> List[ZoneResponse]:
        zones = await zone_repo.get_all()
        # Query all active/upcoming bookings from CouchDB to ensure accurate slot reflection
        try:
            active_bookings = await booking_repo.get_all(status="upcoming")
            reserved_slot_ids = {b.slotId for b in active_bookings}

            for zone in zones:
                zone_modified = False
                for s in zone.slots:
                    if s.id in reserved_slot_ids:
                        if s.status == "available":
                            s.status = "reserved"
                            zone_modified = True
                    elif s.status == "reserved" and s.id not in reserved_slot_ids:
                        s.status = "available"
                        zone_modified = True

                if zone_modified:
                    try:
                        zone.updated_at = utc_now_iso()
                        await zone_repo.save(zone)
                    except Exception as exc:
                        logger.debug(f"Sync zone save conflict or skipped for {zone.id}: {exc}")
        except Exception as e:
            logger.warning(f"Failed to sync zone slot statuses with bookings: {e}")

        return [format_zone_response(z) for z in zones]

    async def get_zone_by_id(self, zone_id: str) -> ZoneResponse:
        zone = await zone_repo.get_by_id(zone_id)
        if not zone:
            zone = await zone_repo.get_by_code(zone_id.replace("zone-", ""))
        if not zone:
            raise DocumentNotFoundError(f"Parking zone '{zone_id}' not found.")

        try:
            active_bookings = await booking_repo.get_all(status="upcoming")
            reserved_slot_ids = {b.slotId for b in active_bookings}
            zone_modified = False
            for s in zone.slots:
                if s.id in reserved_slot_ids and s.status == "available":
                    s.status = "reserved"
                    zone_modified = True
                elif s.status == "reserved" and s.id not in reserved_slot_ids:
                    s.status = "available"
                    zone_modified = True
            if zone_modified:
                try:
                    zone.updated_at = utc_now_iso()
                    await zone_repo.save(zone)
                except Exception:
                    pass
        except Exception as e:
            logger.debug(f"Sync error in get_zone_by_id: {e}")

        return format_zone_response(zone)

    async def get_zone_by_code(self, code: str) -> ZoneResponse:
        zone = await zone_repo.get_by_code(code)
        if not zone:
            raise DocumentNotFoundError(f"Parking zone with code '{code}' not found.")

        try:
            active_bookings = await booking_repo.get_all(status="upcoming")
            reserved_slot_ids = {b.slotId for b in active_bookings}
            zone_modified = False
            for s in zone.slots:
                if s.id in reserved_slot_ids and s.status == "available":
                    s.status = "reserved"
                    zone_modified = True
                elif s.status == "reserved" and s.id not in reserved_slot_ids:
                    s.status = "available"
                    zone_modified = True
            if zone_modified:
                try:
                    zone.updated_at = utc_now_iso()
                    await zone_repo.save(zone)
                except Exception:
                    pass
        except Exception as e:
            logger.debug(f"Sync error in get_zone_by_code: {e}")

        return format_zone_response(zone)

    async def create_zone(self, req: ZoneCreateRequest) -> ZoneResponse:
        code = req.code.strip().upper()

        # Check duplicate code
        existing = await zone_repo.get_by_code(code)
        if existing:
            raise ValidationError(f"A parking zone with code '{code}' already exists.")

        zone_id = f"zone-{code.lower()}"
        slot_count = req.slotCount or 16
        slots: List[Slot] = []

        for i in range(1, slot_count + 1):
            num_str = f"{code}-{str(i).zfill(2)}"
            if i <= 2:
                slot_type = "Accessible"
            elif i <= 4:
                slot_type = "EV Charging"
            elif i <= 6:
                slot_type = "Compact"
            elif i == slot_count:
                slot_type = "Motorcycle"
            else:
                slot_type = "Standard"

            slots.append(
                Slot(
                    id=num_str,
                    number=num_str,
                    zoneCode=code,
                    type=slot_type,
                    status="available",
                    level=1 if i <= 15 else 2,
                    pricePerHour=3.5 if slot_type == "EV Charging" else req.hourlyRate or 2.0,
                    notes="",
                )
            )

        new_zone = ZoneDocument(
            _id=zone_id,
            type="zone",
            code=code,
            name=req.name.strip(),
            tagline=req.tagline or "Newly registered campus parking facility",
            typeOfParking=req.type or "Surface Lot",
            isCovered=bool(req.isCovered),
            hasEv=bool(req.hasEv),
            hasAccessible=True,
            distanceMinutes=req.distanceMinutes or 5,
            hourlyRate=req.hourlyRate or 2.0,
            ratesInfo=req.ratesInfo or "Standard university permits accepted",
            landmark=req.landmark or "Campus East Ground",
            slots=slots,
            created_at=utc_now_iso(),
            updated_at=utc_now_iso(),
        )

        saved = await zone_repo.save(new_zone)
        logger.info(f"Created new zone '{saved.code}' with {len(slots)} initial bays.")
        return format_zone_response(saved)

    async def update_zone(self, zone_id: str, req: ZoneUpdateRequest) -> ZoneResponse:
        zone = await zone_repo.get_by_id(zone_id)
        if not zone:
            raise DocumentNotFoundError(f"Zone '{zone_id}' not found.")

        if req.name is not None:
            zone.name = req.name.strip()
        if req.tagline is not None:
            zone.tagline = req.tagline.strip()
        if req.type is not None:
            zone.typeOfParking = req.type
        if req.isCovered is not None:
            zone.isCovered = req.isCovered
        if req.hasEv is not None:
            zone.hasEv = req.hasEv
        if req.hasAccessible is not None:
            zone.hasAccessible = req.hasAccessible
        if req.distanceMinutes is not None:
            zone.distanceMinutes = req.distanceMinutes
        if req.hourlyRate is not None:
            zone.hourlyRate = req.hourlyRate
        if req.ratesInfo is not None:
            zone.ratesInfo = req.ratesInfo.strip()
        if req.landmark is not None:
            zone.landmark = req.landmark.strip()

        zone.updated_at = utc_now_iso()
        saved = await zone_repo.save(zone)
        return format_zone_response(saved)

    async def delete_zone(self, zone_id: str) -> bool:
        zone = await zone_repo.get_by_id(zone_id)
        if not zone:
            raise DocumentNotFoundError(f"Zone '{zone_id}' not found.")
        rev = zone.rev
        if not rev:
            raise ValidationError("Zone revision missing.")
        return await zone_repo.delete(zone_id, rev)


zone_service = ZoneService()
