from contextlib import asynccontextmanager
from fastapi import FastAPI
import stripe

from app.core.config import init_config
from app.core.logger import init_logger
from app.core.middleware import init_middleware
from app.db.database import Database, Base
import app.db.models

def create_app():
    config = init_config()
    init_logger(config.log_level, config.log_to_file)
    db = Database(config.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        db.engine.dispose()

    app = FastAPI(lifespan=lifespan)

    init_middleware(app, config)

    stripe.api_key = config.stripe_key

    app.state.get_session = db.get_session

    return app