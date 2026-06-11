from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import ContentNotFound

def init_exception_handlers(app):

    @app.exception_handler(Exception)
    async def exception_handler(req, exc):
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"},
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_error_handler(req, exc):
        return JSONResponse(
            status_code=400,
            content={
                "message": "Invalid user data",
                "errors": exc.errors(),
            },
        )

    @app.exception_handler(ContentNotFound)
    async def content_not_found_handler(req, exc):
        return JSONResponse(
            status_code=404,
            content={"message": "Content Not Found"},
        )