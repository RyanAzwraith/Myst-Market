from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from fastapi.exceptions import RequestValidationError 

from app.core import get_logger
from app.core.exceptions import (
    AppException,
    AppError,
)


def init_exception_handlers(app):


    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        get_logger().app.error(exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "name": exc.name,
                "message": exc.message,
                "details": exc.details,
            }
        )

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        get_logger().api.debug(exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "name": exc.name,
                "message": exc.message,
                "details": exc.details,
            }
        )
    
    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError):
        get_logger().app.error(exc)
        return JSONResponse(
            status_code=500,
            content={
                "name": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.errors(),
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def request_validation_error_handler(request: Request, exc: RequestValidationError):
        get_logger().api.debug(exc)
        return JSONResponse(
            status_code=422,
            content={
                "name":"RequestValidationError",
                "message": "RequestValidationError",
                "details": exc.errors(),
            }
        )
    
    @app.exception_handler(Exception)
    async def exception_handler(request: Request, exc: Exception):
        get_logger().app.error(exc)
        return JSONResponse(
            status_code=500,
            content={
                "name": exc.__class__.__name__,
                "message": str(exc),
                "details": {},
            }
        )
    