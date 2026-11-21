import pytest
from datetime import datetime, timedelta, timezone
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_booking_creation_and_double_booking_prevention():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login as Student
        login_resp = await client.post(
            "/api/auth/login",
            json={"email": "student@campus.edu", "password": "Student@2026"},
        )
        assert login_resp.status_code == 200
        student_token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {student_token}"}

        # Select an available slot and dynamic future date to ensure repeatability
        import random
        target_slot = "B-10"
        future_days = random.randint(30, 999)
        test_date = (datetime.now(timezone.utc) + timedelta(days=future_days)).strftime("%Y-%m-%d")

        booking_payload = {
            "slotId": target_slot,
            "zoneCode": "B",
            "zoneName": "Zone B — Engineering Hall",
            "date": test_date,
            "startTime": "10:00",
            "endTime": "13:00",
            "vehiclePlate": "ABC-1234",
            "vehicleModel": "Honda Civic",
            "vehicleType": "Standard",
        }

        # Create first booking
        resp1 = await client.post("/api/bookings", headers=headers, json=booking_payload)
        assert resp1.status_code == 201
        booking1 = resp1.json()
        assert booking1["slotId"] == target_slot
        assert booking1["status"] == "upcoming"
        booking_id = booking1["id"]

        # Verify the slot is now marked as 'reserved' in the zone API & CouchDB
        zone_resp = await client.get("/api/zones/zone-b")
        assert zone_resp.status_code == 200
        slot_obj = next(s for s in zone_resp.json()["slots"] if s["id"] == target_slot)
        assert slot_obj["status"] == "reserved"

        # 2. Attempt double booking for overlapping time (11:00 to 14:00)
        overlapping_payload = {
            "slotId": target_slot,
            "zoneCode": "B",
            "zoneName": "Zone B — Engineering Hall",
            "date": test_date,
            "startTime": "11:00",
            "endTime": "14:00",
            "vehiclePlate": "DIFF-5555",
            "vehicleModel": "Ford Focus",
            "vehicleType": "Standard",
        }
        resp2 = await client.post("/api/bookings", headers=headers, json=overlapping_payload)
        assert resp2.status_code == 409  # Conflict! Double booking prevented!

        # 3. Verify user can get their bookings
        my_bookings_resp = await client.get("/api/bookings/my", headers=headers)
        assert my_bookings_resp.status_code == 200
        my_bookings = my_bookings_resp.json()
        ids = [b["id"] for b in my_bookings]
        assert booking_id in ids

        # 4. Cancel booking
        cancel_resp = await client.patch(
            f"/api/bookings/{booking_id}/cancel",
            headers=headers,
            json={"reason": "Class cancelled"},
        )
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()["status"] == "cancelled"

        # Verify the slot status is returned to 'available' after cancellation
        zone_resp_cancelled = await client.get("/api/zones/zone-b")
        assert zone_resp_cancelled.status_code == 200
        slot_obj_cancelled = next(s for s in zone_resp_cancelled.json()["slots"] if s["id"] == target_slot)
        assert slot_obj_cancelled["status"] == "available"

        # 5. Restore / Undo cancellation
        restore_resp = await client.patch(
            f"/api/bookings/{booking_id}/restore",
            headers=headers,
        )
        assert restore_resp.status_code == 200
        assert restore_resp.json()["status"] == "upcoming"
