import asyncio
from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Dict
from app.config import settings
from app.core.security import hash_password
from app.database import db_client
from app.models.common import utc_now_iso
from app.scripts.initialize_db import initialize_databases

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("campuspark.seed_db")


def generate_slots_for_zone(zone_code: str, count: int) -> list:
    slots = []
    for i in range(1, count + 1):
        num_str = f"{zone_code}-{str(i).zfill(2)}"
        if i <= 3:
            s_type = "Accessible"
        elif i <= 6:
            s_type = "EV Charging"
        elif i <= 9:
            s_type = "Compact"
        elif i == count or i == count - 1:
            s_type = "Motorcycle"
        else:
            s_type = "Standard"

        status = "available"
        if i == 13 or i == 22:
            status = "disabled"
        elif i % 4 == 0:
            status = "occupied"
        elif i % 7 == 0:
            status = "reserved"

        slots.append({
            "id": num_str,
            "number": num_str,
            "zoneCode": zone_code,
            "type": s_type,
            "status": status,
            "level": 1 if i <= 15 else 2,
            "pricePerHour": 3.5 if s_type == "EV Charging" else 2.0,
            "notes": "Sensor calibration & resurfacing underway" if status == "disabled" else "",
        })
    return slots


SEED_USERS_DATA = [
    {
        "_id": "user-student-1",
        "type": "user",
        "name": "Maya Lin",
        "email": "student@campus.edu",
        "plain_password": "Student@2026",
        "role": "Student",
        "department": "Computer Science",
        "vehicles": [
            {"plate": "ABC-1234", "model": "Honda Civic (Silver)", "type": "Standard"}
        ],
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        "permitType": "Semester Student Pass #STU-9921",
        "is_active": True,
    },
    {
        "_id": "user-faculty-1",
        "type": "user",
        "name": "Dr. Arthur Vance",
        "email": "faculty@campus.edu",
        "plain_password": "Faculty@2026",
        "role": "Faculty",
        "department": "Electrical Engineering",
        "vehicles": [
            {"plate": "FAC-9081", "model": "Toyota Prius Prime (Blue EV)", "type": "EV"}
        ],
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        "permitType": "Faculty Reserved Pass #FAC-4402",
        "is_active": True,
    },
    {
        "_id": "user-admin-1",
        "type": "user",
        "name": "Sarah Jenkins",
        "email": "admin@campus.edu",
        "plain_password": "Admin@2026",
        "role": "Admin",
        "department": "Campus Facilities & Transportation",
        "vehicles": [
            {"plate": "ADM-0001", "model": "Subaru Outback (Navy)", "type": "Standard"}
        ],
        "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
        "permitType": "Campus Operations Administrator",
        "is_active": True,
    },
    {
        "_id": "user-staff-1",
        "type": "user",
        "name": "David Miller",
        "email": "staff@campus.edu",
        "plain_password": "Staff@2026",
        "role": "Staff",
        "department": "Student Affairs",
        "vehicles": [
            {"plate": "STF-4412", "model": "Ford Focus (White)", "type": "Standard"}
        ],
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        "permitType": "Staff Regular #STF-1029",
        "is_active": True,
    },
    {
        "_id": "user-visitor-1",
        "type": "user",
        "name": "Jordan Lee",
        "email": "visitor@campus.edu",
        "plain_password": "Visitor@2026",
        "role": "Visitor",
        "department": "Guest / Guest Speaker",
        "vehicles": [
            {"plate": "VIS-5520", "model": "Tesla Model 3 (Black)", "type": "EV"}
        ],
        "avatarUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
        "permitType": "Daily Visitor Permit",
        "is_active": True,
    },
]

SEED_ZONES_DATA = [
    {
        "_id": "zone-a",
        "type": "zone",
        "code": "A",
        "name": "Zone A — Engineering & Science Deck",
        "tagline": "Covered multi-level deck adjacent to Tech Tower and Lab Complex",
        "typeOfParking": "Covered Deck",
        "isCovered": True,
        "hasEv": True,
        "hasAccessible": True,
        "distanceMinutes": 2,
        "hourlyRate": 2.50,
        "ratesInfo": "Free with Student/Faculty Permit • $2.50/hr Visitor",
        "landmark": "Adjacent to Engineering Quad & Robotics Hall",
        "slots": generate_slots_for_zone("A", 26),
    },
    {
        "_id": "zone-b",
        "type": "zone",
        "code": "B",
        "name": "Zone B — North Residence & Dorms Lot",
        "tagline": "Spacious surface lot convenient for residential halls and dining commons",
        "typeOfParking": "Surface Lot",
        "isCovered": False,
        "hasEv": True,
        "hasAccessible": True,
        "distanceMinutes": 4,
        "hourlyRate": 1.50,
        "ratesInfo": "Resident Permits 24/7 • Visitor parking permitted 8am–6pm",
        "landmark": "Between Birch Hall and North Dining Court",
        "slots": generate_slots_for_zone("B", 30),
    },
    {
        "_id": "zone-c",
        "type": "zone",
        "code": "C",
        "name": "Zone C — Humanities & Central Library Garage",
        "tagline": "Central underground garage beneath the main learning commons and library",
        "typeOfParking": "Underground",
        "isCovered": True,
        "hasEv": True,
        "hasAccessible": True,
        "distanceMinutes": 1,
        "hourlyRate": 3.00,
        "ratesInfo": "All Permits Accepted • High EV charger density",
        "landmark": "Below William James Memorial Library",
        "slots": generate_slots_for_zone("C", 28),
    },
    {
        "_id": "zone-d",
        "type": "zone",
        "code": "D",
        "name": "Zone D — Athletics & Arena Complex",
        "tagline": "High-capacity perimeter lot designed for sports events and overflow",
        "typeOfParking": "Surface Lot",
        "isCovered": False,
        "hasEv": False,
        "hasAccessible": True,
        "distanceMinutes": 6,
        "hourlyRate": 1.00,
        "ratesInfo": "Free with any campus permit • Shuttle pick-up every 10 min",
        "landmark": "Next to Campus Stadium and Aquatic Pavilion",
        "slots": generate_slots_for_zone("D", 32),
    },
    {
        "_id": "zone-e",
        "type": "zone",
        "code": "E",
        "name": "Zone E — Health Sciences & Medical Annex",
        "tagline": "Dedicated clinic and lab parking with priority patient and faculty access",
        "typeOfParking": "Covered Deck",
        "isCovered": True,
        "hasEv": True,
        "hasAccessible": True,
        "distanceMinutes": 3,
        "hourlyRate": 2.00,
        "ratesInfo": "Priority Health Staff • Clinic visitors validated",
        "landmark": "West Wing of University Medical Center",
        "slots": generate_slots_for_zone("E", 24),
    },
    {
        "_id": "zone-f",
        "type": "zone",
        "code": "F",
        "name": "Zone F — Administration & Welcome Pavilion",
        "tagline": "Premium front-campus parking for admissions, visitors, and executive staff",
        "typeOfParking": "Surface Lot",
        "isCovered": False,
        "hasEv": True,
        "hasAccessible": True,
        "distanceMinutes": 1,
        "hourlyRate": 3.50,
        "ratesInfo": "Visitor pass required or Admin permit",
        "landmark": "Opposite Main Campus Gatehouse and Visitor Center",
        "slots": generate_slots_for_zone("F", 24),
    },
]

INITIAL_INBOX_DATA = [
    {
        "_id": "rep-1",
        "type": "inbox_item",
        "user": "Prof. Vance (Faculty)",
        "zone": "Zone C",
        "slot": "C-04",
        "issue": "EV Charger connector cable handle loose",
        "severity": "Medium",
        "status": "Pending",
        "date": "Today, 8:15 AM",
        "createdAt": utc_now_iso(),
    },
    {
        "_id": "rep-2",
        "type": "inbox_item",
        "user": "Security Patrol Desk",
        "zone": "Zone B",
        "slot": "B-14",
        "issue": "Unauthorized vehicle without parking decal parked overnight",
        "severity": "High",
        "status": "Pending",
        "date": "Yesterday, 11:40 PM",
        "createdAt": utc_now_iso(),
    },
    {
        "_id": "rep-3",
        "type": "inbox_item",
        "user": "Student Affairs",
        "zone": "Zone A",
        "slot": "A-13",
        "issue": "Surface repaving caution tape verified intact",
        "severity": "Low",
        "status": "Resolved",
        "date": "2 days ago",
        "createdAt": utc_now_iso(),
        "resolvedAt": utc_now_iso(),
    },
]


def generate_seed_bookings() -> list:
    now = datetime.now(timezone.utc)
    f1_start = now + timedelta(hours=2)
    f1_end = f1_start + timedelta(hours=3)

    f2_start = now + timedelta(hours=26)
    f2_end = f2_start + timedelta(hours=4)

    p1_start = now - timedelta(hours=24)
    p1_end = p1_start + timedelta(hours=2)

    p2_start = now - timedelta(hours=72)
    p2_end = p2_start + timedelta(hours=4)

    c_start = now - timedelta(hours=48)
    c_end = c_start + timedelta(hours=3)

    return [
        {
            "_id": "BK-98421",
            "type": "booking",
            "userId": "user-student-1",
            "userName": "Maya Lin",
            "userRole": "Student",
            "zoneId": "zone-a",
            "zoneName": "Zone A — Engineering & Science Deck",
            "slotId": "A-07",
            "slotNumber": "A-07",
            "slotType": "Standard",
            "licensePlate": "ABC-1234",
            "vehicleModel": "Honda Civic (Silver)",
            "startIso": f1_start.isoformat(),
            "endIso": f1_end.isoformat(),
            "status": "upcoming",
            "permitUsed": "Semester Student Pass",
            "rateCharged": 0.00,
            "createdAt": (now - timedelta(minutes=10)).isoformat(),
            "updatedAt": (now - timedelta(minutes=10)).isoformat(),
        },
        {
            "_id": "BK-98422",
            "type": "booking",
            "userId": "user-faculty-1",
            "userName": "Dr. Arthur Vance",
            "userRole": "Faculty",
            "zoneId": "zone-c",
            "zoneName": "Zone C — Humanities & Central Library Garage",
            "slotId": "C-04",
            "slotNumber": "C-04",
            "slotType": "EV Charging",
            "licensePlate": "FAC-9081",
            "vehicleModel": "Toyota Prius Prime",
            "startIso": f2_start.isoformat(),
            "endIso": f2_end.isoformat(),
            "status": "upcoming",
            "permitUsed": "Faculty Reserved Pass",
            "rateCharged": 0.00,
            "createdAt": (now - timedelta(hours=2)).isoformat(),
            "updatedAt": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "_id": "BK-87310",
            "type": "booking",
            "userId": "user-student-1",
            "userName": "Maya Lin",
            "userRole": "Student",
            "zoneId": "zone-b",
            "zoneName": "Zone B — North Residence & Dorms Lot",
            "slotId": "B-11",
            "slotNumber": "B-11",
            "slotType": "Standard",
            "licensePlate": "ABC-1234",
            "vehicleModel": "Honda Civic (Silver)",
            "startIso": p1_start.isoformat(),
            "endIso": p1_end.isoformat(),
            "status": "completed",
            "permitUsed": "Semester Student Pass",
            "rateCharged": 0.00,
            "createdAt": (now - timedelta(hours=30)).isoformat(),
            "updatedAt": (now - timedelta(hours=30)).isoformat(),
        },
        {
            "_id": "BK-85124",
            "type": "booking",
            "userId": "user-student-1",
            "userName": "Maya Lin",
            "userRole": "Student",
            "zoneId": "zone-a",
            "zoneName": "Zone A — Engineering & Science Deck",
            "slotId": "A-02",
            "slotNumber": "A-02",
            "slotType": "Accessible",
            "licensePlate": "ABC-1234",
            "vehicleModel": "Honda Civic (Silver)",
            "startIso": p2_start.isoformat(),
            "endIso": p2_end.isoformat(),
            "status": "completed",
            "permitUsed": "Semester Student Pass",
            "rateCharged": 0.00,
            "createdAt": (now - timedelta(hours=80)).isoformat(),
            "updatedAt": (now - timedelta(hours=80)).isoformat(),
        },
        {
            "_id": "BK-77401",
            "type": "booking",
            "userId": "user-student-1",
            "userName": "Maya Lin",
            "userRole": "Student",
            "zoneId": "zone-f",
            "zoneName": "Zone F — Administration & Welcome Pavilion",
            "slotId": "F-05",
            "slotNumber": "F-05",
            "slotType": "Compact",
            "licensePlate": "ABC-1234",
            "vehicleModel": "Honda Civic (Silver)",
            "startIso": c_start.isoformat(),
            "endIso": c_end.isoformat(),
            "status": "cancelled",
            "permitUsed": "Semester Student Pass",
            "rateCharged": 0.00,
            "cancelledAt": (now - timedelta(hours=47)).isoformat(),
            "cancelReason": "Lecture rescheduled online",
            "createdAt": (now - timedelta(hours=55)).isoformat(),
            "updatedAt": (now - timedelta(hours=47)).isoformat(),
        },
    ]


async def seed_all_data(force_reseed: bool = False) -> Dict[str, Any]:
    """
    Import seed users, parking zones, initial bookings, and incident reports.
    Converts plaintext demo passwords to bcrypt hashes.
    Idempotent: skips existing documents unless force_reseed=True.
    """
    await initialize_databases()

    summary = {
        "users": {"created": 0, "skipped": 0, "updated": 0},
        "zones": {"created": 0, "skipped": 0, "updated": 0},
        "bookings": {"created": 0, "skipped": 0, "updated": 0},
        "inbox": {"created": 0, "skipped": 0, "updated": 0},
    }

    # 1. Seed Users
    for u in SEED_USERS_DATA:
        doc_id = u["_id"]
        existing = await db_client.get_document(settings.DB_USERS, doc_id)
        if existing and not force_reseed:
            summary["users"]["skipped"] += 1
            continue

        doc = dict(u)
        plain = doc.pop("plain_password")
        doc["password_hash"] = hash_password(plain)
        doc["created_at"] = utc_now_iso()
        doc["updated_at"] = utc_now_iso()

        if existing and force_reseed:
            doc["_rev"] = existing["_rev"]
            summary["users"]["updated"] += 1
        else:
            summary["users"]["created"] += 1

        await db_client.save_document(settings.DB_USERS, doc)

    # 2. Seed Zones
    for z in SEED_ZONES_DATA:
        doc_id = z["_id"]
        existing = await db_client.get_document(settings.DB_ZONES, doc_id)
        if existing and not force_reseed:
            summary["zones"]["skipped"] += 1
            continue

        doc = dict(z)
        doc["created_at"] = utc_now_iso()
        doc["updated_at"] = utc_now_iso()

        if existing and force_reseed:
            doc["_rev"] = existing["_rev"]
            summary["zones"]["updated"] += 1
        else:
            summary["zones"]["created"] += 1

        await db_client.save_document(settings.DB_ZONES, doc)

    # 3. Seed Bookings
    bookings = generate_seed_bookings()
    for b in bookings:
        doc_id = b["_id"]
        existing = await db_client.get_document(settings.DB_BOOKINGS, doc_id)
        if existing and not force_reseed:
            summary["bookings"]["skipped"] += 1
            continue

        doc = dict(b)
        if existing and force_reseed:
            doc["_rev"] = existing["_rev"]
            summary["bookings"]["updated"] += 1
        else:
            summary["bookings"]["created"] += 1

        await db_client.save_document(settings.DB_BOOKINGS, doc)

    # 4. Seed Inbox
    for i in INITIAL_INBOX_DATA:
        doc_id = i["_id"]
        existing = await db_client.get_document(settings.DB_INBOX, doc_id)
        if existing and not force_reseed:
            summary["inbox"]["skipped"] += 1
            continue

        doc = dict(i)
        if existing and force_reseed:
            doc["_rev"] = existing["_rev"]
            summary["inbox"]["updated"] += 1
        else:
            summary["inbox"]["created"] += 1

        await db_client.save_document(settings.DB_INBOX, doc)

    logger.info(f"Database seeding complete: {summary}")
    return summary


if __name__ == "__main__":
    asyncio.run(seed_all_data(force_reseed=False))
