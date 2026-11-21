import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_auth_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/login",
            json={"email": "student@campus.edu", "password": "Student@2026"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "student@campus.edu"
        assert data["user"]["role"] == "Student"


@pytest.mark.asyncio
async def test_auth_login_invalid_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/login",
            json={"email": "student@campus.edu", "password": "WrongPassword!"},
        )
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_prevent_admin_self_registration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "Hacker Admin",
                "email": "fake_admin@campus.edu",
                "password": "Password123!",
                "role": "Admin",
            },
        )
        # Should be forbidden or rejected
        assert response.status_code in [400, 403]


@pytest.mark.asyncio
async def test_auth_register_and_get_me():
    import uuid
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        test_email = f"user_{uuid.uuid4().hex[:6]}@campus.edu"
        reg_response = await client.post(
            "/api/auth/register",
            json={
                "name": "Test User",
                "email": test_email,
                "password": "Password@2026",
                "role": "Student",
                "department": "Engineering",
                "vehiclePlate": "TEST-999",
                "vehicleModel": "Toyota Corolla",
            },
        )
        assert reg_response.status_code == 201
        reg_data = reg_response.json()
        token = reg_data["access_token"]
        assert token

        # Call /api/auth/me
        me_response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["email"] == test_email
        assert me_data["role"] == "Student"
