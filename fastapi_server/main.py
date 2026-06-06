from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

import fastapi_server.context as ctx

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
    return {"message": "Myst Market API running with DB"}

ctx.logger.init.debug("logger working")
ctx.Exceptions.AppMissingFieldError("exceptions work").log()


# uvicorn main:app --reload

# uvicorn fastapi_server.main:app
# - runs server
