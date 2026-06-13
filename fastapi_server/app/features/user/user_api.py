from fastapi import APIRouter, Depends, Cookie, Response
from pydantic import BaseModel, ConfigDict, EmailStr

from app.utils.to_camel import to_camel
from app.api.dependencies import get_session, get_current_user, get_admin_user
from app.core.exceptions import (
    AuthenticationException
)

from .user_service import (
    get_user,
    get_user_by_email, 
    create_user, 
    update_user, 
    delete_user, 
    verify_password
)

from .auth_service import (
    issue_tokens, 
    decode_token, 
    create_access_token
)

router = APIRouter()


# Routes
#   PATCH /user/me
#   DELETE /user/me
#   DELETE /users/{user_id}
#   POST /auth/login
#   GET /auth/logout
#   GET /auth/refresh
#   PUT /auth/register

## Sub Types

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)
    id: int
    email: str
    is_admin: bool
    is_registered: bool
    name: str


# PATCH /user/me
class UserPatchRequest(BaseModel):
    email: EmailStr | None = None
    name: str | None = None
    password: str | None = None  

type UserPatchResponse = UserResponse

@router.patch("/user/me", status_code=200, response_model=UserPatchResponse)
async def patch_user_route(req: UserPatchRequest, current_user=Depends(get_current_user), session=Depends(get_session)):
    return update_user(session, current_user.id, req)

# DELETE /user/me
@router.delete("/user/me", status_code=204)
async def delete_user_route(current_user=Depends(get_current_user), session=Depends(get_session)):
    delete_user(session, current_user.id)
    return None

# DELETE /admin/users/{user_id}
@router.delete("/admin/users/{user_id}", status_code=204)
async def admin_delete_user_route(user_id:int, _=Depends(get_admin_user), session=Depends(get_session)):
    delete_user(session, user_id)
    return None

# POST /auth/login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)
    access_token: str
    userResponse: UserResponse

@router.post("/auth/login", status_code=200, response_model=LoginResponse)
async def login_route(req: LoginRequest, res: Response, session=Depends(get_session)):
    db_user = get_user_by_email(session, req.email)
    verify_password(req.password, db_user.password_hash)
    access_token = issue_tokens(db_user.id, res)
    return LoginResponse( access_token=access_token, userResponse=db_user)

# GET /auth/logout
@router.get("/auth/logout", status_code=200)
async def logout_route(res: Response):
    res.delete_cookie(
        key="refresh_token",
        path="/",
    )
    return None

# // GET /auth/refresh
class RefreshResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)
    access_token: str

@router.get("/auth/refresh", status_code=200, response_model=RefreshResponse)
async def refresh_route(refresh_token=Cookie(default=None)):
    if not refresh_token:
        raise AuthenticationException("Missing Refresh Token")
    
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise AuthenticationException("Invalid token type")
    
    user_id = int(payload["sub"])
    access_token = create_access_token(user_id=user_id)
    
    return RefreshResponse(access_token=access_token,)

# PUT /auth/register
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

type RegisterResponse = LoginResponse

@router.post("/auth/register", status_code=201, response_model=RegisterResponse)
async def register_route(req: RegisterRequest, res: Response, session=Depends(get_session)):
    db_user = create_user(session, req)
    access_token = issue_tokens(db_user.id, res)
    return RegisterResponse(access_token=access_token, userResponse=db_user)   
