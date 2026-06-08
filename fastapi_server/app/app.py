from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import stripe

from app.core.config import init_config
from app.core.logger import init_logger
from app.core import exceptions
from app.db.database import Database


def create_app():
    config = init_config()
    logger = init_logger(config)
    db = Database(config)
    db.Base.metadata.create_all(bind=db.engine) #remove

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        db.engine.dispose()

    app = FastAPI(lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    stripe.api_key = config.stripe_secret_key

    app.state.logger = logger
    app.state.exceptions = exceptions
    app.state.get_session = db.get_session

    return app