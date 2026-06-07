from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.context import ctx

ORIGINS = [
    "http://localhost:5173",
]

app = FastAPI(lifespan=ctx.lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    ctx.logger.init.debug('hello world, this is ctx.logger.init.debug')
    exc = ctx.exceptions.AppException({"message":"hello world, this is ctx.logger.init.debug(ctx.exceptions.AppException"})
    ctx.logger.init.info(exc)
    return {"message": "Myst Market API running with DB"}

# uvicorn main:app --reload
# python -m uvicorn app.main:app --reload
# - runs server

