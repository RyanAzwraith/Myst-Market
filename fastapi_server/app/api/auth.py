from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/login")
async def login(request: Request):
    body = await request.json()
    
    return 200, {
        "accessToken": "abcdefg123456",
        "refreshToken": "hfedcba654321",
        "user": {
            "id": "2",
            "email": "user@mail.com",
            "isAdmin": False,
            "isRegistered": True,
            "name": "John Doe",
        }
    }

@router.post("/logout")
async def logout(request: Request):
    body = await request.json()
    
    return 200 