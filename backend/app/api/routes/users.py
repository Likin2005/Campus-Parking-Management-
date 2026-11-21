from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_current_user, require_admin
from app.models.user import UserDocument
from app.schemas.auth import UserProfileResponse
from app.schemas.user import UserUpdateRequest, UserVehiclesUpdateRequest
from app.services.user_service import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: UserDocument = Depends(get_current_user)):
    return await user_service.get_profile(current_user.id)


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    updates: UserUpdateRequest, current_user: UserDocument = Depends(get_current_user)
):
    return await user_service.update_profile(current_user.id, updates)


@router.put("/me/vehicles", response_model=UserProfileResponse)
async def update_my_vehicles(
    payload: UserVehiclesUpdateRequest, current_user: UserDocument = Depends(get_current_user)
):
    return await user_service.update_vehicles(current_user.id, payload.vehicles)


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_by_id(
    user_id: str, current_user: UserDocument = Depends(get_current_user)
):
    if current_user.role != "Admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this user profile.",
        )
    return await user_service.get_profile(user_id)
