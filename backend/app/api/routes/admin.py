from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import require_admin
from app.models.user import UserDocument
from app.repositories.inbox_repository import inbox_repo
from app.schemas.dashboard import InboxItemResponse, MessageResponse
from app.scripts.seed_database import seed_all_data

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


@router.get("/inbox", response_model=List[InboxItemResponse])
async def get_inbox_reports(current_admin: UserDocument = Depends(require_admin)):
    """Retrieve security patrol and user facility incident reports."""
    items = await inbox_repo.get_all()
    return [
        InboxItemResponse(
            id=i.id or "",
            user=i.user,
            zone=i.zone,
            slot=i.slot,
            issue=i.issue,
            severity=i.severity,
            status=i.status,
            date=i.date,
            createdAt=i.createdAt,
            resolvedAt=i.resolvedAt,
        )
        for i in items
    ]


@router.patch("/inbox/{item_id}/resolve", response_model=InboxItemResponse)
async def resolve_inbox_report(
    item_id: str, current_admin: UserDocument = Depends(require_admin)
):
    """Mark a maintenance or safety report as resolved."""
    updated = await inbox_repo.resolve(item_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report #{item_id} was not found.",
        )
    return InboxItemResponse(
        id=updated.id or "",
        user=updated.user,
        zone=updated.zone,
        slot=updated.slot,
        issue=updated.issue,
        severity=updated.severity,
        status=updated.status,
        date=updated.date,
        createdAt=updated.createdAt,
        resolvedAt=updated.resolvedAt,
    )


@router.post("/reset-demo", response_model=MessageResponse)
async def reset_demo_database(current_admin: UserDocument = Depends(require_admin)):
    """Reset all CouchDB collections back to clean academic demo seeds."""
    summary = await seed_all_data(force_reseed=True)
    return MessageResponse(
        message="All zones, slots, users, and bookings restored to demo seeds in CouchDB.",
        data=summary,
    )
