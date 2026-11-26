from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
import stripe

from app.core.config import init_config
from app.core.logger import init_logger
from app.core.implementations import init_database, init_media_system
from app.api.middleware import init_middleware
from app.api.exception_handlers import init_exception_handlers
from app.api.router import router
import resend

from app.implementations.database.sqlite.prod_seed import seed_database



def create_app():
    config = init_config()
    init_logger(config.log_level, config.log_to_file)
    media_system = init_media_system(config)
    db = init_database(config)

    database_path = db.engine.url.database
    database_exists = (
        database_path is not None
        and database_path != ":memory:"
        and Path(database_path).is_file()
    )
    if config.seed_db and not database_exists:
        seed_database(config.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        session_generator = db.session_factory()
        session = next(session_generator)
        try:
            pass
            # commented out media cleanup for demo so images dont get deleted accidently
            # db.with_session(session).media.cleanup()
            # media_system.cleanup() 
        finally:
            session_generator.close()
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
