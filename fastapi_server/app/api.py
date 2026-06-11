
from fastapi import APIRouter, Request

from app.features.auth_feature import router as auth_router
from app.features.user_feature import router as user_outer

router = APIRouter()
router.include_router(auth_router)
router.include_router(user_outer)

@router.get("/health")
def getHealth():
    return 200
