"""CampusPark FastAPI Application Entrypoint.

Provides REST APIs for:
- Authentication & JWT Session Management
- Parking Zones & Slot Discovery
- Server-side Booking Engine with CouchDB OCC Lock Coordination
- User Profile & Vehicle Management
- Admin Control Panel (Zones, Slots, Reports, Demo Data Reset)
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import admin, auth, bookings, dashboard, health, users, zones
from app.config import settings
from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    BookingConflictError,
    CampusParkException,
    DatabaseConnectionError,
    DocumentConflictError,
    DocumentNotFoundError,
    SlotUnavailableError,
    ValidationError,
)
from app.database import db_client
from app.scripts.initialize_db import initialize_databases

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("campuspark.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle events."""
    logger.info("Initializing CampusPark backend services...")
    try:
        # Check connection and ensure databases and Mango indexes exist
        await db_client.check_connection()
        await initialize_databases()
        logger.info("CouchDB connection and collections verified.")
    except Exception as exc:
        logger.error("Failed to connect to CouchDB at startup: %s", exc)

    yield

    logger.info("CampusPark backend shutting down.")
    await db_client.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Campus Parking Management System REST API powered by Apache CouchDB and FastAPI.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = settings.ALLOWED_ORIGINS
if not origins or origins == ["*"]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(DocumentNotFoundError)
async def not_found_handler(request: Request, exc: DocumentNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message, "error": "NOT_FOUND"},
    )


@app.exception_handler(BookingConflictError)
async def booking_conflict_handler(request: Request, exc: BookingConflictError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": exc.message, "error": "BOOKING_CONFLICT"},
    )


@app.exception_handler(DocumentConflictError)
async def document_conflict_handler(request: Request, exc: DocumentConflictError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": exc.message, "error": "DOCUMENT_CONFLICT"},
    )


@app.exception_handler(AuthorizationError)
async def authorization_handler(request: Request, exc: AuthorizationError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message, "error": "FORBIDDEN"},
    )


@app.exception_handler(AuthenticationError)
async def authentication_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message, "error": "UNAUTHORIZED"},
    )


@app.exception_handler(SlotUnavailableError)
async def slot_unavailable_handler(request: Request, exc: SlotUnavailableError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "error": "SLOT_UNAVAILABLE"},
    )


@app.exception_handler(ValidationError)
async def validation_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.message, "error": "VALIDATION_ERROR"},
    )


@app.exception_handler(CampusParkException)
async def generic_app_handler(request: Request, exc: CampusParkException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "error": "BAD_REQUEST"},
    )


# API Routers with /api prefix
api_prefix = "/api"
app.include_router(health.router, prefix=api_prefix)
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(zones.router, prefix=api_prefix)
app.include_router(bookings.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api": "/api",
        "database": "Apache CouchDB",
    }