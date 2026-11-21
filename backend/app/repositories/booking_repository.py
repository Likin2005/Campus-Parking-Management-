from datetime import datetime
from typing import List, Optional
from app.config import settings
from app.database import db_client
from app.models.booking import BookingDocument


def parse_iso(iso_str: str) -> datetime:
    """Safely parse ISO 8601 string to datetime."""
    clean = iso_str.replace("Z", "+00:00")
    return datetime.fromisoformat(clean)


def intervals_overlap(start_a_iso: str, end_a_iso: str, start_b_iso: str, end_b_iso: str) -> bool:
    """
    Mathematical time interval overlap rule:
    max(startA, startB) < min(endA, endB)
    Adjacent slots where one ends exactly as another begins do NOT overlap.
    """
    start_a = parse_iso(start_a_iso)
    end_a = parse_iso(end_a_iso)
    start_b = parse_iso(start_b_iso)
    end_b = parse_iso(end_b_iso)

    return max(start_a, start_b) < min(end_a, end_b)


class BookingRepository:
    def __init__(self):
        self.db = settings.DB_BOOKINGS

    async def get_by_id(self, booking_id: str) -> Optional[BookingDocument]:
        doc = await db_client.get_document(self.db, booking_id)
        if doc and doc.get("type") == "booking":
            return BookingDocument(**doc)
        return None

    async def get_by_user(self, user_id: str) -> List[BookingDocument]:
        docs = await db_client.find(
            self.db,
            selector={"type": "booking", "userId": user_id},
        )
        bookings = [BookingDocument(**d) for d in docs]
        # Sort descending by startIso
        bookings.sort(key=lambda b: b.startIso, reverse=True)
        return bookings

    async def get_all(self, status: Optional[str] = None) -> List[BookingDocument]:
        selector = {"type": "booking"}
        if status:
            selector["status"] = status
        docs = await db_client.find(self.db, selector=selector)
        bookings = [BookingDocument(**d) for d in docs]
        bookings.sort(key=lambda b: b.startIso, reverse=True)
        return bookings

    async def find_overlapping(
        self,
        slot_id: str,
        start_iso: str,
        end_iso: str,
        exclude_booking_id: Optional[str] = None,
    ) -> List[BookingDocument]:
        """
        Query all active bookings for slot_id from CouchDB and
        detect time collisions.
        """
        docs = await db_client.find(
            self.db,
            selector={
                "type": "booking",
                "slotId": slot_id,
                "status": {"$ne": "cancelled"},
            },
        )

        conflicts: List[BookingDocument] = []
        for d in docs:
            b = BookingDocument(**d)
            if exclude_booking_id and b.id == exclude_booking_id:
                continue
            if intervals_overlap(start_iso, end_iso, b.startIso, b.endIso):
                conflicts.append(b)

        return conflicts

    async def save(self, booking: BookingDocument) -> BookingDocument:
        doc_dict = booking.model_dump(by_alias=True, exclude_none=True)
        saved = await db_client.save_document(self.db, doc_dict)
        return BookingDocument(**saved)


booking_repo = BookingRepository()
