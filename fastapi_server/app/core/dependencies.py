from fastapi import Request
from sqlalchemy.orm import Session

def get_session(req: Request) -> Session:
    yield from req.app.state.get_session() 