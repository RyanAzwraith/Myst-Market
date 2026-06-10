from fastapi import  Request
from fastapi.middleware.cors import CORSMiddleware

async def log_requests(request: Request, call_next):
    body = await request.body()
    response = await call_next(request)
    request.app.state.logger.api.debug(
        f"""req: {request.method} {request.url} - {dict(request.headers).get("auth")}
        {body.decode(errors="replace")}
        res: {response.status_code}
        """
    )
    return response

def init_middleware(app, config):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.middleware("http")(log_requests)


