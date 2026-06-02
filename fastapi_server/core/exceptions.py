from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging


logger = logging.getLogger("api")


def setup_exception_handlers(app: FastAPI):

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception,
    ):
        logger.error(
            f"Unhandled exception: {str(exc)}",
            exc_info=True,
        )

        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error"
            },
        )