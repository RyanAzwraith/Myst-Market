from contextlib import asynccontextmanager
from fastapi import FastAPI

from .core.config import init_config
from .core.logger import init_logger
from .core import exceptions
from .db.database import Database

class Context:
    def __init__(self):
        self.config = None
        self.logger = None
        self.exceptions = exceptions
        self.engine = None
        self.session_factory = None

    @asynccontextmanager
    async def lifespan(self, app: FastAPI):
        self.config = init_config()
        self.logger = init_logger(self.config)
        self.db = Database(self.config)
        self.get_session = self.db.get_session

        yield

        self.db.engine.dispose()

ctx = Context()