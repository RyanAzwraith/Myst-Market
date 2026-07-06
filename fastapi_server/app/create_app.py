from contextlib import asynccontextmanager
from fastapi import FastAPI
import stripe

from app.core.config import init_config
from app.core.logger import init_logger
from app.api.middleware import init_middleware
from app.db.database import Database
from app.api.exception_handlers import init_exception_handlers
from app.api.router import router
import resend

def create_app():
    config = init_config()
    init_logger(config.log_level, config.log_to_file)
    db = Database(config.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        db.engine.dispose()

    app = FastAPI(lifespan=lifespan)

    init_middleware(app, config.cors_origins)
    init_exception_handlers(app)

    stripe.api_key = config.stripe_key
    resend.api_key = config.resend_key
    app.state.db = db
    
    app.include_router(router)

    return app