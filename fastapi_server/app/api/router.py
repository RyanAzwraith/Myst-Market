
from fastapi import APIRouter

from app.features.user.user_api import router as user_router

router = APIRouter()
router.include_router(user_router)

@router.get("/health")
def getHealth():
    return 200
