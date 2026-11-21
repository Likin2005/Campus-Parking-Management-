from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.dependencies import get_current_user
from app.models.user import UserDocument
from app.schemas.booking import (
    BookingCancelRequest,
    BookingCreateRequest,
    BookingResponse,
)
from app.services.booking_service import booking_service

router = APIRouter(prefix="/bookings", tags=["Parking Bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    req: BookingCreateRequest, current_user: UserDocument = Depends(get_current_user)
):
    """
    Reserve a parking bay with server-side time-overlap validation
    and CouchDB atomic lock coordination.
    """
    return await booking_service.create_booking(current_user, req)


@router.get("/my", response_model=List[BookingResponse])
async def get_my_bookings(current_user: UserDocument = Depends(get_current_user)):
    """Retrieve all reservations owned by the current user."""
    return await booking_service.get_user_bookings(current_user.id)


@router.get("/history", response_model=List[BookingResponse])
async def get_my_history(current_user: UserDocument = Depends(get_current_user)):
    """Retrieve past, completed, and cancelled reservation records."""
    return await booking_service.get_user_bookings(current_user.id)


@router.get("", response_model=List[BookingResponse])
async def get_all_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: UserDocument = Depends(get_current_user),
):
    """
    Retrieve bookings. Normal users receive their own bookings;
    Admins can view all campus reservations across all users.
    """
    if current_user.role == "Admin":
        return await booking_service.get_all_bookings(status=status_filter)
    return await booking_service.get_user_bookings(current_user.id)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_details(
    booking_id: str, current_user: UserDocument = Depends(get_current_user)
):
    """Retrieve digital parking pass details for a specific reservation."""
    return await booking_service.get_booking_by_id(booking_id, current_user)


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    req: BookingCancelRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Cancel an upcoming reservation and release the bay."""
    return await booking_service.cancel_booking(booking_id, current_user, req)


@router.patch("/{booking_id}/restore", response_model=BookingResponse)
async def restore_booking(
    booking_id: str, current_user: UserDocument = Depends(get_current_user)
):
    """Undo cancellation and restore slot reservation if bay is still free."""
    return await booking_service.restore_booking(booking_id, current_user)
