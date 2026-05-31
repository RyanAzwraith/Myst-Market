from sqlalchemy.orm import sessionmaker
from db.database import engine
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