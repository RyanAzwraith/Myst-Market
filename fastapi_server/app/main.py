
from app.app import create_app
from app.api.api import router as api_router

app = create_app()
app.include_router(api_router)

# uvicorn main:app --reload
# python -m uvicorn app.main:app --reload
# - runs server

