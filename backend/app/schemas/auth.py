from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import Vehicle


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = True


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "Student"  # Student, Faculty, Staff, Visitor (Admin not allowed self-registration)
    licensePlate: Optional[str] = None
    vehicleModel: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str = ""
    vehicles: List[Vehicle] = Field(default_factory=list)
    avatarUrl: str = ""
    permitType: str = "Standard Campus Permit"
    is_active: bool = True
    rememberMe: Optional[bool] = True

    class Config:
        populate_by_name = True


class AuthResponse(BaseModel):
    user: UserProfileResponse
    access_token: str
    token_type: str = "bearer"
