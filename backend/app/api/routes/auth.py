from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_current_user
from app.models.user import UserDocument
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserProfileResponse
from app.schemas.dashboard import MessageResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """Register a new student, faculty, staff, or visitor account."""
    return await auth_service.register(req)


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Authenticate with college credentials and receive signed JWT access token."""
    return await auth_service.login(req)


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: UserDocument = Depends(get_current_user)):
    """Retrieve profile of the currently authenticated user."""
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department=current_user.department,
        vehicles=current_user.vehicles,
        avatarUrl=current_user.avatarUrl,
        permitType=current_user.permitType,
        is_active=current_user.is_active,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: UserDocument = Depends(get_current_user)):
    """Client-side token disposal endpoint."""
    return MessageResponse(message="Successfully signed out of CampusPark.")
