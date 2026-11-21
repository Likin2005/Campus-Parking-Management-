from typing import Any, Dict
from fastapi import APIRouter
from app.config import settings
from app.database import db_client

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Check backend operational health and Apache CouchDB connectivity."""
    db_status = "connected"
    couch_meta = None
    try:
        couch_meta = await db_client.check_connection()
    except Exception as exc:
        db_status = f"unavailable: {exc}"

    return {
        "status": "ok" if "connected" in db_status else "degraded",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "type": "Apache CouchDB",
            "status": db_status,
            "version": couch_meta.get("version") if couch_meta else None,
        },
    }
