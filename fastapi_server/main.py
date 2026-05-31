from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi_server.db.database import engine
from fastapi_server.db.base import Base

app = FastAPI()

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

# TEMP: create tables automatically (dev only)
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Myst Market API running with DB"}


# uvicorn main:app --reload
# - runs server