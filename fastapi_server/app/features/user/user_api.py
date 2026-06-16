from fastapi import APIRouter, Depends, Cookie, Response
from pydantic import BaseModel, ConfigDict, EmailStr

from app.utils.to_camel import to_camel
from app.api.dependencies import (
    get_session, get_current_user, 
    get_admin_user, 
    get_set_password_user
)
from app.core.exceptions import (
    ContentNotFoundException,
    AuthenticationException,
    ConflictException
)
from .user_service import (
    get_user,
    get_user_by_email, 
    create_user, 
    update_user, 
    deactivate_user, 
    verify_password
)
from .auth_service import (
    issue_tokens, 
    decode_token, 
    create_access_token,
    create_set_password_token,
    send_set_password_email
)


router = APIRouter()

# Routes
#   POST /login
#   POST /logout
#   GET /refresh
#   PUT /register
#   POST /user/me/set-password-email
#   PATCH /user/me
#   PATCH /user/me/password
#   DELETE /user/me
#   DELETE /users/{user_id}


## Sub Types

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)
    id: int
    email: str
    is_admin: bool
    is_registered: bool
    name: str

# POST /login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)
    access_token: str
    userResponse: UserResponse

@router.post("/login", status_code=200, response_model=LoginResponse)
async def login_route(req: LoginRequest, res: Response, session=Depends(get_session)):
    try:
        db_user = get_user_by_email(session, req.email)
        if not db_user.is_registered:
            raise AuthenticationException("User is not registered") 
        verify_password(req.password, db_user.password_hash)
        access_token = issue_tokens(db_user.id, res)
        return LoginResponse( access_token=access_token, userResponse=db_user)
    except (AuthenticationException, ContentNotFoundException):
        raise AuthenticationException("Incorrect email or password")
        
# POST /logout
@router.post("/logout", status_code=200)
async def logout_route(res: Response):
    res.delete_cookie(
        key="refresh_token",
        path="/",
    )
    return None

# GET /refresh
class RefreshResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)
    access_token: str

@router.get("/refresh", status_code=200, response_model=RefreshResponse)
async def refresh_route(refresh_token=Cookie(default=None), session=Depends(get_session)):
    if not refresh_token:
        raise AuthenticationException("Missing Refresh Token")
    
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise AuthenticationException("Invalid token type")
    
    user_id = int(payload["sub"])
    db_user = get_user(session, user_id)
    if not db_user.is_registered:
        raise ConflictException("User is not registered")
    access_token = create_access_token(user_id=user_id)
    
    return RefreshResponse(access_token=access_token,)

# PUT /register
class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
@router.post("/register", status_code=200)
async def register_route(req: RegisterRequest, session=Depends(get_session)):
    db_user = create_user(session, req)
    send_set_password_email(db_user.email, create_set_password_token(db_user.id))
    return None

# POST /POST /user/me/set-password-email
@router.post("/user/me/set-password-email", status_code=200)
async def post_set_password_email_route(current_user=Depends(get_current_user)):
    send_set_password_email(current_user.email, create_set_password_token(current_user.id))
    return None

# PATCH /user/me
class UserPatchRequest(BaseModel):
    email: EmailStr | None = None
    name: str | None = None
    password: str | None = None  
UserPatchResponse = UserResponse

@router.patch("/user/me", status_code=200, response_model=UserPatchResponse)
async def patch_user_route(req: UserPatchRequest, current_user=Depends(get_current_user), session=Depends(get_session)):
    return update_user(session, current_user.id, req)

# PATCH /user/me/password
class UserPatchPasswordRequest(BaseModel):
    password: str
UserPatchPasswordResponse = LoginResponse
@router.patch("/user/me/password", status_code=200, response_model=UserPatchPasswordResponse)
async def patch_user_password_route(req: UserPatchPasswordRequest, res: Response, current_user=Depends(get_set_password_user), session=Depends(get_session)):
    db_user = update_user(session, current_user.id, req)
    access_token = issue_tokens(db_user.id, res)
    return UserPatchPasswordResponse( access_token=access_token, userResponse=db_user)

# DELETE /user/me
@router.delete("/user/me", status_code=204)
async def deactivate_user_route(res: Response, current_user=Depends(get_current_user), session=Depends(get_session)):
    deactivate_user(session, current_user.id)
    res.delete_cookie(
        key="refresh_token",
        path="/",
    )
    return None

# DELETE /users/{user_id}
@router.delete("/users/{user_id}", status_code=204)
async def admin_deactivate_user_route(user_id:int, _=Depends(get_admin_user), session=Depends(get_session)):
    deactivate_user(session, user_id)
    return None