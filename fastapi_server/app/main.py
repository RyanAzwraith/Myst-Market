
from app.app import create_app
from app.api import router as api_router

app = create_app()

# uvicorn app.main:app --reload
# python -m uvicorn app.main:app --reload
# - runs server

