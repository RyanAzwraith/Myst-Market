from .config import get_config
from .logger import get_logger
from .exceptions import (
    AppError,
    AuthenticationException,
    AuthorizationException,
    ContentNotFoundException,
    ConflictException,
    ValidationException,
    RequestException,
)


def __getattr__(name):
    if name in {"get_database", "get_media_system"}:
        from . import implementations

        return getattr(implementations, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

__all__ = [
    "get_config", 
    "get_logger", 
    "get_database",
    "get_media_system",
    "AppError",
    "AuthenticationException",
    "AuthorizationException",
    "ContentNotFoundException",
    "ConflictException",
    "ValidationException",
    "RequestException"
]