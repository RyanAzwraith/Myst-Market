
from fastapi import APIRouter, Request

from .auth import router as authRouter
from .user import router as userRouter



router = APIRouter()
router.include_router(authRouter)
router.include_router(userRouter)


@router.get("/health")
def getHealth():
    return 200

@router.get("/hello")
def getHello(request: Request):
    request.app.state.logger.init.debug('hello world, this is ctx.logger.init.debug')
    exc = request.app.state.exceptions.AppException({"message":"hello world, this is ctx.logger.init.debug(ctx.exceptions.AppException"})
    request.app.state.logger.init.info(exc)
    return 200, {"message": "hello"}
