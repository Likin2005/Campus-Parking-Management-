class CampusParkException(Exception):
    """Base exception for CampusPark backend application."""
    def __init__(self, message: str, status_code: int = 400, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class DatabaseConnectionError(CampusParkException):
    def __init__(self, message: str = "Unable to connect to Apache CouchDB database."):
        super().__init__(message=message, status_code=503)


class DocumentNotFoundError(CampusParkException):
    def __init__(self, message: str = "Requested document was not found."):
        super().__init__(message=message, status_code=404)


class DocumentConflictError(CampusParkException):
    def __init__(self, message: str = "Document revision conflict occurred (409 Conflict)."):
        super().__init__(message=message, status_code=409)


class AuthenticationError(CampusParkException):
    def __init__(self, message: str = "Invalid credentials or unauthenticated request."):
        super().__init__(message=message, status_code=401)


class AuthorizationError(CampusParkException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(message=message, status_code=403)


class BookingConflictError(CampusParkException):
    def __init__(self, message: str = "Slot is already reserved for the selected timeframe."):
        super().__init__(message=message, status_code=409)


class SlotUnavailableError(CampusParkException):
    def __init__(self, message: str = "Slot is under maintenance or currently unavailable."):
        super().__init__(message=message, status_code=400)


class ValidationError(CampusParkException):
    def __init__(self, message: str = "Validation failed for supplied data."):
        super().__init__(message=message, status_code=422)
