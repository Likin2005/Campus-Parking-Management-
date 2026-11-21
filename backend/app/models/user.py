from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.common import CouchDBBaseModel, utc_now_iso


class Vehicle(BaseModel):
    plate: str
    model: str = "Registered Vehicle"
    type: str = "Standard"


class UserDocument(CouchDBBaseModel):
    type: str = "user"
    name: str
    email: str
    password_hash: str
    role: str = "Student"  # Student, Faculty, Staff, Visitor, Admin
    department: str = ""
    vehicles: List[Vehicle] = Field(default_factory=list)
    avatarUrl: str = ""
    permitType: str = "Standard Campus Permit"
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)
