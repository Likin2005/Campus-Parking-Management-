import logging
from typing import List, Optional
from app.core.exceptions import DocumentNotFoundError
from app.models.common import utc_now_iso
from app.models.user import UserDocument, Vehicle
from app.repositories.user_repository import user_repo
from app.schemas.auth import UserProfileResponse
from app.schemas.user import UserUpdateRequest

logger = logging.getLogger("campuspark.user_service")


class UserService:
    async def get_profile(self, user_id: str) -> UserProfileResponse:
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise DocumentNotFoundError("User profile not found.")
        return UserProfileResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            department=user.department,
            vehicles=user.vehicles,
            avatarUrl=user.avatarUrl,
            permitType=user.permitType,
            is_active=user.is_active,
        )

    async def update_profile(self, user_id: str, updates: UserUpdateRequest) -> UserProfileResponse:
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise DocumentNotFoundError("User profile not found.")

        if updates.name is not None:
            user.name = updates.name.strip()
        if updates.department is not None:
            user.department = updates.department.strip()
        if updates.avatarUrl is not None:
            user.avatarUrl = updates.avatarUrl.strip()
        if updates.vehicles is not None:
            user.vehicles = updates.vehicles

        user.updated_at = utc_now_iso()
        saved = await user_repo.save(user)
        logger.info(f"Updated profile for user '{saved.id}'")

        return UserProfileResponse(
            id=saved.id,
            name=saved.name,
            email=saved.email,
            role=saved.role,
            department=saved.department,
            vehicles=saved.vehicles,
            avatarUrl=saved.avatarUrl,
            permitType=saved.permitType,
            is_active=saved.is_active,
        )

    async def update_vehicles(self, user_id: str, vehicles: List[Vehicle]) -> UserProfileResponse:
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise DocumentNotFoundError("User profile not found.")

        user.vehicles = vehicles
        user.updated_at = utc_now_iso()
        saved = await user_repo.save(user)

        return UserProfileResponse(
            id=saved.id,
            name=saved.name,
            email=saved.email,
            role=saved.role,
            department=saved.department,
            vehicles=saved.vehicles,
            avatarUrl=saved.avatarUrl,
            permitType=saved.permitType,
            is_active=saved.is_active,
        )


user_service = UserService()
