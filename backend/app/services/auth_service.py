import logging
import uuid
from typing import Tuple
from app.core.exceptions import AuthenticationError, AuthorizationError, ValidationError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.common import utc_now_iso
from app.models.user import UserDocument, Vehicle
from app.repositories.user_repository import user_repo
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserProfileResponse

logger = logging.getLogger("campuspark.auth_service")


class AuthService:
    async def register(self, req: RegisterRequest) -> AuthResponse:
        # Prevent public admin self-registration
        role = req.role.strip()
        if role.lower() == "admin":
            raise AuthorizationError(
                "Administrative roles cannot be self-registered. Please contact Campus Facilities."
            )

        allowed_roles = ["Student", "Faculty", "Staff", "Visitor"]
        if role not in allowed_roles:
            role = "Student"

        normalized_email = req.email.strip().lower()

        # Check duplicate email
        existing = await user_repo.get_by_email(normalized_email)
        if existing:
            raise ValidationError("An account with this email address already exists. Try signing in instead.")

        user_id = f"user-{uuid.uuid4().hex[:8]}"

        vehicles = []
        if req.licensePlate:
            clean_plate = req.licensePlate.strip().upper()
            model = req.vehicleModel.strip() if req.vehicleModel else "Registered Vehicle"
            vehicles.append(Vehicle(plate=clean_plate, model=model, type="Standard"))
        else:
            vehicles.append(Vehicle(plate="CAMPUS-1", model="Registered Vehicle", type="Standard"))

        permit_number = f"#CP-{uuid.uuid4().int % 9000 + 1000}"
        permit_type = f"{role} Parking Permit {permit_number}"

        new_user = UserDocument(
            _id=user_id,
            type="user",
            name=req.name.strip(),
            email=normalized_email,
            password_hash=hash_password(req.password),
            role=role,
            department="General Campus",
            vehicles=vehicles,
            avatarUrl=f"https://api.dicebear.com/7.x/initials/svg?seed={req.name.strip()}&backgroundColor=12306B",
            permitType=permit_type,
            is_active=True,
            created_at=utc_now_iso(),
            updated_at=utc_now_iso(),
        )

        saved_user = await user_repo.save(new_user)
        logger.info(f"Registered new user '{saved_user.email}' with role '{saved_user.role}'")

        token = create_access_token({"sub": saved_user.id, "email": saved_user.email, "role": saved_user.role})

        profile = UserProfileResponse(
            id=saved_user.id,
            name=saved_user.name,
            email=saved_user.email,
            role=saved_user.role,
            department=saved_user.department,
            vehicles=saved_user.vehicles,
            avatarUrl=saved_user.avatarUrl,
            permitType=saved_user.permitType,
            is_active=saved_user.is_active,
            rememberMe=True,
        )

        return AuthResponse(user=profile, access_token=token, token_type="bearer")

    async def login(self, req: LoginRequest) -> AuthResponse:
        normalized_email = req.email.strip().lower()
        user = await user_repo.get_by_email(normalized_email)

        if not user:
            raise AuthenticationError("Invalid email or password. Please check your credentials.")

        if not user.is_active:
            raise AuthenticationError("This account has been deactivated. Please contact Campus Facilities.")

        if not verify_password(req.password, user.password_hash):
            raise AuthenticationError("Invalid email or password. Please check your credentials.")

        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        logger.info(f"User '{user.email}' successfully authenticated.")

        profile = UserProfileResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            department=user.department,
            vehicles=user.vehicles,
            avatarUrl=user.avatarUrl,
            permitType=user.permitType,
            is_active=user.is_active,
            rememberMe=req.rememberMe,
        )

        return AuthResponse(user=profile, access_token=token, token_type="bearer")


auth_service = AuthService()
