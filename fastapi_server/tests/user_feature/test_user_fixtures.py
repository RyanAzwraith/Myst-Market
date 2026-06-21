import pytest

from app.features.user.user_service import create_user
from app.db.models import User
from app.features.user.auth_service import (
    create_access_token,
    decode_token,
    create_refresh_token,
)
from app.core.exceptions import (
    AuthenticationException,
    ConflictException
)
from app.features.user.user_service import (
    hash_password,
    verify_password,
    update_user,
    create_user
)


