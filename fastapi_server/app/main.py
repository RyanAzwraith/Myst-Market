
from app.app import create_app
from app.api.strip.checkout import router

app = create_app()

app.include_router(router)

@app.get("/")
def root():

    return {"message": "Myst Market API running with DB"}

@app.get("/hello")
def hello():
    app.state.logger.init.debug('hello world, this is ctx.logger.init.debug')
    exc = app.state.exceptions.AppException({"message":"hello world, this is ctx.logger.init.debug(ctx.exceptions.AppException"})
    app.state.logger.init.info(exc)

# uvicorn main:app --reload
# python -m uvicorn app.main:app --reload
# - runs server

