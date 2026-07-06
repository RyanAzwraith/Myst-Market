from fastapi import APIRouter

from app.core import get_config
from app.core.exceptions import AuthorizationException

from app.features.user.user_api import router as user_router
from app.api.test_api import router as test_router

router = APIRouter()
router.include_router(user_router)
router.include_router(test_router)


@router.get("/health")
def getHealth():
    return 200
