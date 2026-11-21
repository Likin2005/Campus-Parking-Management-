from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.models.user import Vehicle
from app.schemas.auth import UserProfileResponse


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    avatarUrl: Optional[str] = None
    vehicles: Optional[List[Vehicle]] = None


class UserVehiclesUpdateRequest(BaseModel):
    vehicles: List[Vehicle]
