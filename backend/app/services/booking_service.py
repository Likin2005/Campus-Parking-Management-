from datetime import datetime, timedelta, timezone
import logging
import random
import uuid
from typing import List, Optional
from app.core.exceptions import (
    AuthorizationError,
    BookingConflictError,
    DocumentNotFoundError,
    SlotUnavailableError,
    ValidationError,
)
from app.models.booking import BookingDocument
from app.models.common import utc_now_iso
from app.models.user import UserDocument
from app.repositories.booking_repository import booking_repo
from app.repositories.lock_repository import SlotLockContext
from app.repositories.zone_repository import zone_repo
from app.schemas.booking import BookingCancelRequest, BookingCreateRequest, BookingResponse

logger = logging.getLogger("campuspark.booking_service")


def combine_date_and_time_iso(date_str: str, time_str: str) -> str:
    """
    Combine date string (YYYY-MM-DD) and time string (HH:MM)
    into a standardized UTC ISO 8601 string.
    """
    try:
        combined = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        return combined.replace(tzinfo=timezone.utc).isoformat()
    except Exception as exc:
        raise ValidationError(f"Invalid date/time format: {exc}")


def format_booking_response(b: BookingDocument) -> BookingResponse:
    return BookingResponse(
        id=b.id or "",
        userId=b.userId,
        userName=b.userName,
        userRole=b.userRole,
        zoneId=b.zoneId,
        zoneName=b.zoneName,
        slotId=b.slotId,
        slotNumber=b.slotNumber,
        slotType=b.slotType,
        licensePlate=b.licensePlate,
        vehicleModel=b.vehicleModel,
        startIso=b.startIso,
        endIso=b.endIso,
        status=b.status,
        permitUsed=b.permitUsed,
        rateCharged=b.rateCharged,
        createdAt=b.createdAt,
        updatedAt=b.updatedAt,
        cancelledAt=b.cancelledAt,
        cancelReason=b.cancelReason,
    )


class BookingService:
    async def create_booking(self, user: UserDocument, req: BookingCreateRequest) -> BookingResponse:
        # 1. Validate date & time
        start_iso = combine_date_and_time_iso(req.date, req.startTime)
        end_iso = combine_date_and_time_iso(req.date, req.endTime)

        start_dt = datetime.fromisoformat(start_iso)
        end_dt = datetime.fromisoformat(end_iso)

        if end_dt <= start_dt:
            raise ValidationError("End time must be after the start time.")

        # 2. Validate license plate
        plate = req.licensePlate.strip().upper()
        if len(plate) < 3 or len(plate) > 10:
            raise ValidationError("License plate must be between 3 and 10 characters (e.g. ABC-1234).")

        # 3. Locate zone and slot
        zone = await zone_repo.get_by_id(req.zoneId)
        if not zone:
            zone = await zone_repo.get_by_code(req.zoneId.replace("zone-", ""))
        if not zone:
            raise DocumentNotFoundError(f"Parking zone '{req.zoneId}' was not found.")

        target_slot = None
        for s in zone.slots:
            if s.id == req.slotId:
                target_slot = s
                break

        if not target_slot:
            raise DocumentNotFoundError(f"Slot '{req.slotId}' was not found in zone '{zone.code}'.")

        if target_slot.status == "disabled":
            raise SlotUnavailableError(
                f"Slot '{req.slotId}' is currently undergoing maintenance and cannot be reserved."
            )

        # 4. Acquire atomic CouchDB lock on this slot to prevent simultaneous double-booking
        lock_owner = f"{user.id}-{uuid.uuid4().hex[:6]}"
        async with SlotLockContext(target_slot.id, lock_owner):
            # Check for existing overlapping active bookings in CouchDB
            conflicts = await booking_repo.find_overlapping(target_slot.id, start_iso, end_iso)
            if conflicts:
                raise BookingConflictError(
                    f"Slot {target_slot.id} is already reserved for this timeframe. Please choose a different slot or time."
                )

            # Calculate duration and fee
            duration_hours = max(1.0, (end_dt - start_dt).total_seconds() / 3600.0)
            is_free_permit = user.role in ["Student", "Faculty", "Staff"]
            hourly_rate = target_slot.pricePerHour or zone.hourlyRate or 2.0
            rate_charged = 0.0 if is_free_permit else round(duration_hours * hourly_rate, 2)

            permit_used = (
                user.permitType
                if is_free_permit
                else ("Visitor Hourly Pass" if user.role == "Visitor" else f"{user.role} Pass")
            )

            booking_id = f"BK-{random.randint(10000, 99999)}"

            new_booking = BookingDocument(
                _id=booking_id,
                type="booking",
                userId=user.id,
                userName=user.name,
                userRole=user.role,
                zoneId=zone.id or f"zone-{zone.code.lower()}",
                zoneName=zone.name,
                slotId=target_slot.id,
                slotNumber=target_slot.number,
                slotType=target_slot.type,
                licensePlate=plate,
                vehicleModel=req.vehicleModel or "Registered Vehicle",
                startIso=start_iso,
                endIso=end_iso,
                status="upcoming",
                permitUsed=permit_used,
                rateCharged=rate_charged,
                createdAt=utc_now_iso(),
                updatedAt=utc_now_iso(),
            )

            saved_booking = await booking_repo.save(new_booking)

            # Persistently reflect the reservation in the zone document in CouchDB
            try:
                fresh_zone = await zone_repo.get_by_id(zone.id) or zone
                for s in fresh_zone.slots:
                    if s.id == target_slot.id:
                        s.status = "reserved"
                        break
                fresh_zone.updated_at = utc_now_iso()
                await zone_repo.save(fresh_zone)
                logger.info(f"Slot '{target_slot.id}' in zone '{zone.code}' updated to 'reserved' in CouchDB.")
            except Exception as e:
                logger.warning(f"Could not immediately update slot status in zone '{zone.id}': {e}")
                try:
                    fresh_zone = await zone_repo.get_by_id(zone.id)
                    if fresh_zone:
                        for s in fresh_zone.slots:
                            if s.id == target_slot.id:
                                s.status = "reserved"
                                break
                        fresh_zone.updated_at = utc_now_iso()
                        await zone_repo.save(fresh_zone)
                except Exception as e2:
                    logger.error(f"Failed to update slot status in zone after retry: {e2}")

            logger.info(f"Created reservation '{saved_booking.id}' for slot '{saved_booking.slotId}' by '{user.email}'")
            return format_booking_response(saved_booking)

    async def get_booking_by_id(self, booking_id: str, current_user: UserDocument) -> BookingResponse:
        booking = await booking_repo.get_by_id(booking_id)
        if not booking:
            raise DocumentNotFoundError(f"Reservation '{booking_id}' not found.")

        # Ownership or Admin check
        if current_user.role != "Admin" and booking.userId != current_user.id:
            raise AuthorizationError("You do not have permission to view this reservation.")

        return format_booking_response(booking)

    async def get_user_bookings(self, user_id: str) -> List[BookingResponse]:
        bookings = await booking_repo.get_by_user(user_id)
        return [format_booking_response(b) for b in bookings]

    async def get_all_bookings(self, status: Optional[str] = None) -> List[BookingResponse]:
        bookings = await booking_repo.get_all(status=status)
        return [format_booking_response(b) for b in bookings]

    async def cancel_booking(
        self, booking_id: str, current_user: UserDocument, req: BookingCancelRequest
    ) -> BookingResponse:
        booking = await booking_repo.get_by_id(booking_id)
        if not booking:
            raise DocumentNotFoundError(f"Booking '{booking_id}' not found.")

        if current_user.role != "Admin" and booking.userId != current_user.id:
            raise AuthorizationError("You can only cancel your own parking reservations.")

        if booking.status == "cancelled":
            return format_booking_response(booking)

        booking.status = "cancelled"
        booking.cancelledAt = utc_now_iso()
        booking.cancelReason = req.reason or "User requested cancellation"
        booking.updatedAt = utc_now_iso()

        saved = await booking_repo.save(booking)

        # Free the slot in the zone if no other upcoming reservations exist
        try:
            other_active = await booking_repo.find_overlapping(
                booking.slotId, "1970-01-01T00:00:00+00:00", "2099-12-31T23:59:59+00:00", exclude_booking_id=booking.id
            )
            if not other_active:
                fresh_zone = await zone_repo.get_by_id(booking.zoneId)
                if fresh_zone:
                    for s in fresh_zone.slots:
                        if s.id == booking.slotId and s.status == "reserved":
                            s.status = "available"
                            break
                    fresh_zone.updated_at = utc_now_iso()
                    await zone_repo.save(fresh_zone)
        except Exception as e:
            logger.warning(f"Could not free slot on cancellation: {e}")

        logger.info(f"Cancelled booking '{booking_id}' for slot '{booking.slotId}'")
        return format_booking_response(saved)

    async def restore_booking(self, booking_id: str, current_user: UserDocument) -> BookingResponse:
        booking = await booking_repo.get_by_id(booking_id)
        if not booking:
            raise DocumentNotFoundError(f"Booking '{booking_id}' not found.")

        if current_user.role != "Admin" and booking.userId != current_user.id:
            raise AuthorizationError("You can only restore your own reservations.")

        # Check for conflict before undoing
        conflicts = await booking_repo.find_overlapping(
            booking.slotId, booking.startIso, booking.endIso, exclude_booking_id=booking.id
        )
        if conflicts:
            raise BookingConflictError(
                f"Cannot restore: Slot {booking.slotNumber} has already been claimed by another user."
            )

        booking.status = "upcoming"
        booking.cancelledAt = None
        booking.cancelReason = None
        booking.updatedAt = utc_now_iso()

        saved = await booking_repo.save(booking)

        # Re-mark slot as reserved in CouchDB
        try:
            fresh_zone = await zone_repo.get_by_id(booking.zoneId)
            if fresh_zone:
                for s in fresh_zone.slots:
                    if s.id == booking.slotId and s.status != "disabled":
                        s.status = "reserved"
                        break
                fresh_zone.updated_at = utc_now_iso()
                await zone_repo.save(fresh_zone)
        except Exception as e:
            logger.warning(f"Could not re-mark slot as reserved on restore: {e}")

        logger.info(f"Restored booking '{booking_id}' for slot '{booking.slotId}'")
        return format_booking_response(saved)


booking_service = BookingService()
