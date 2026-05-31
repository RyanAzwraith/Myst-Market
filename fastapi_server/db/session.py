from sqlalchemy.orm import sessionmaker
from fastapi_server.db.database import engine
from typing import Generator

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()