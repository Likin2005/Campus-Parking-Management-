import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_get_all_zones():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/zones")
        assert response.status_code == 200
        zones = response.json()
        assert len(zones) >= 6
        codes = [z["code"] for z in zones]
        assert "A" in codes
        assert "B" in codes


@pytest.mark.asyncio
async def test_get_single_zone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/zones/zone-a")
        assert response.status_code == 200
        zone = response.json()
        assert zone["code"] == "A"
        assert len(zone["slots"]) > 0


@pytest.mark.asyncio
async def test_update_slot_status_admin_auth():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Non-admin or unauthenticated should fail
        unauth = await client.patch(
            "/api/zones/zone-a/slots/A-05/status",
            json={"status": "disabled", "notes": "Under repair"},
        )
        assert unauth.status_code in [401, 403]

        # Login as Admin
        admin_login = await client.post(
            "/api/auth/login",
            json={"email": "admin@campus.edu", "password": "Admin@2026"},
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]

        # Admin updates slot
        update_resp = await client.patch(
            "/api/zones/zone-a/slots/A-05/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "disabled", "notes": "Under repair"},
        )
        assert update_resp.status_code == 200
        updated_slot = update_resp.json()
        assert updated_slot["status"] == "disabled"
