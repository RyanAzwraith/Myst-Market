from fastapi import APIRouter, Request, Response

import fastapi_server.app.services.authService as authService
import fastapi_server.app.services.userService as userService
router = APIRouter("/auth")

@router.post("/login")
async def login(req: Request, res: Response):
    body = await req.json()

    user = userService.authenticate_user()

    access_token = authService.create_access_token(userService.id)
    refresh_token = authService.create_refresh_token(userService.id)
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return 200, {
        "accessToken": access_token,
        "user": user
    }

@app.post("/login")
def login(response: Response):

    user = authenticate_user()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
    )

    return {
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
        },
    }

@router.post("/logout")
async def logout(request: Request):
    body = await request.json()
    
    return 200 
    