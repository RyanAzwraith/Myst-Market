from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from core.logging import setup_logging
from db.database import engine
from db.base import Base
from dotenv import load_dotenv
from core.exceptions import setup_exception_handlers

load_dotenv()

setup_logging()

app = FastAPI()

setup_exception_handlers(app)
logger = logging.getLogger(__name__)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Myst Market API running with DB"}


# uvicorn main:app --reload
# - runs server
