import asyncio
import logging
from app.config import settings
from app.database import db_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("campuspark.init_db")


async def initialize_databases():
    """
    Connect to CouchDB, ensure required databases exist, and
    create Mango indexes for query performance.
    """
    logger.info(f"Connecting to Apache CouchDB at {settings.COUCHDB_URL}...")
    try:
        meta = await db_client.check_connection()
        logger.info(f"Connected to CouchDB version {meta.get('version', 'unknown')} ({meta.get('vendor', {}).get('name', '')})")
    except Exception as exc:
        logger.error(f"Failed to connect to CouchDB: {exc}")
        raise

    # System databases required by CouchDB
    system_dbs = ["_users", "_replicator"]
    for s_db in system_dbs:
        try:
            created = await db_client.ensure_database(s_db)
            if created:
                logger.info(f"Initialized CouchDB system db: {s_db}")
        except Exception as exc:
            logger.warning(f"Notice on system db {s_db}: {exc}")

    # Application databases
    app_dbs = [
        settings.DB_USERS,
        settings.DB_ZONES,
        settings.DB_BOOKINGS,
        settings.DB_LOCKS,
        settings.DB_INBOX,
    ]

    for db_name in app_dbs:
        created = await db_client.ensure_database(db_name)
        status = "Created" if created else "Verified existing"
        logger.info(f"Database '{db_name}': {status}")

    # Create Mango Indexes
    logger.info("Configuring CouchDB Mango indexes...")

    # 1. Users indexes
    await db_client.create_index(
        settings.DB_USERS,
        fields=["type", "email"],
        name="idx_users_email",
        ddoc="idx_users_email",
    )
    await db_client.create_index(
        settings.DB_USERS,
        fields=["type", "role"],
        name="idx_users_role",
        ddoc="idx_users_role",
    )

    # 2. Zones index
    await db_client.create_index(
        settings.DB_ZONES,
        fields=["type", "code"],
        name="idx_zones_code",
        ddoc="idx_zones_code",
    )

    # 3. Bookings indexes
    await db_client.create_index(
        settings.DB_BOOKINGS,
        fields=["type", "userId", "status"],
        name="idx_bookings_user_status",
        ddoc="idx_bookings_user_status",
    )
    await db_client.create_index(
        settings.DB_BOOKINGS,
        fields=["type", "slotId", "status", "startIso", "endIso"],
        name="idx_bookings_slot_conflict",
        ddoc="idx_bookings_slot_conflict",
    )
    await db_client.create_index(
        settings.DB_BOOKINGS,
        fields=["type", "status", "startIso"],
        name="idx_bookings_timeline",
        ddoc="idx_bookings_timeline",
    )

    # 4. Locks index
    await db_client.create_index(
        settings.DB_LOCKS,
        fields=["type", "slotId", "expiresAt"],
        name="idx_locks_slot_expiry",
        ddoc="idx_locks_slot_expiry",
    )

    # 5. Inbox index
    await db_client.create_index(
        settings.DB_INBOX,
        fields=["type", "status", "createdAt"],
        name="idx_inbox_status_date",
        ddoc="idx_inbox_status_date",
    )

    logger.info("Successfully initialized all CouchDB databases and Mango indexes.")


if __name__ == "__main__":
    asyncio.run(initialize_databases())
