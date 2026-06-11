
from fastapi import APIRouter, Request

from .auth import router as authRouter
from .user import router as userRouter


router = APIRouter()
router.include_router(authRouter)
router.include_router(userRouter)

@router.get("/health")
def getHealth():
    return 200
