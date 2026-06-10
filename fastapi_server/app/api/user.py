from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/user")
async def postUser(request: Request):
    body = await request.json()
    return 204, {
        "id": "2",
        "email": "user@mail.com",
        "isAdmin": False,
        "isRegistered": True,
        "name": "John Doe",
        "accessToken": "abcdefg123456"
    }

@router.get("/user/{user_id}")
async def get(request: Request, user_id: int):
    return 200, {
        "id": user_id,
        "email": "user@mail.com",
        "isAdmin": False,
        "isRegistered": True,
        "name": "John Doe",
        "accessToken": "abcdefg123456"
    }

@router.put("/user/{user_id}")
async def putUser(request: Request, user_id):
    return 200, {
        "id": user_id,
        "email": "user@mail.com",
        "isAdmin": False,
        "isRegistered": True,
        "name": "John Doe",
        "accessToken": "abcdefg123456"
    }

@router.delete("/user/{user_id}")
async def deleteUser(request: Request):
    return 204