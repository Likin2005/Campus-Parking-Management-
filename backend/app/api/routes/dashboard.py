from typing import Any, Dict
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.models.user import UserDocument
from app.schemas.dashboard import DashboardStatsResponse
from app.services.booking_service import booking_service
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats():
    """Retrieve campus-wide live aggregated occupancy and capacity metrics."""
    return await dashboard_service.get_campus_stats()


@router.get("/my-summary")
async def get_my_summary(current_user: UserDocument = Depends(get_current_user)) -> Dict[str, Any]:
    """Retrieve quick stats and next upcoming booking for the authenticated user."""
    user_bookings = await booking_service.get_user_bookings(current_user.id)
    upcoming = [b for b in user_bookings if b.status == "upcoming"]
    completed = [b for b in user_bookings if b.status == "completed"]
    cancelled = [b for b in user_bookings if b.status == "cancelled"]

    next_booking = upcoming[0] if upcoming else None

    return {
        "upcomingCount": len(upcoming),
        "completedCount": len(completed),
        "cancelledCount": len(cancelled),
        "nextBooking": next_booking,
    }
