from fastapi import APIRouter, Request, Response, Depends, HTTPException, Cookie
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, ConfigDict
import jwt
import bcrypt

from app.core import config, logger, get_session
from app.db.models import User
from app.features.user_feature import UserResponse, hash_password

ALGORITHM = "HS256"

ACCESS_TOKEN_MINUTES = 15
REFRESH_TOKEN_DAYS = 30

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8")
    )

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(
        payload,
        config().jwt_key,
        algorithm=ALGORITHM,
    )

def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc)
            + timedelta(days=REFRESH_TOKEN_DAYS),
    }
    return jwt.encode(
        payload,
        config().jwt_key,
        algorithm=ALGORITHM,
    )

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            config().jwt_key,
            algorithms=[ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def issue_tokens(user_id: int):
    return create_access_token(user_id), create_refresh_token(user_id)

router = APIRouter(prefix="/auth")

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    access_token: str
    user: UserResponse

@router.post("/login", status_code=200, response_model=LoginResponse)
async def login(login_req: LoginRequest, res: Response, session=Depends(get_session)):
    user = session.query(User).filter(User.email == login_req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Content Not Found")

    if not verify_password(login_req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token, refresh_token = issue_tokens(user.id)
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60,
        path="/"
    )
    return LoginResponse(
        access_token=access_token,
        user=user
    )

@router.post("/logout", status_code=200)
async def logout(res: Response):
    res.delete_cookie(
        key="refresh_token",
        path="/",
    )
    return {"message": "Logged out"}

class RefreshResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    access_token: str

@router.post("/refresh", status_code=200, response_model=RefreshResponse)
async def refresh(refresh_token: str | None = Cookie(default=None), session=Depends(get_session)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = int(payload["sub"])
    access_token = create_access_token(user_id=user_id)
    return RefreshResponse(
        access_token=access_token,
    )

class RegisterRequest(BaseModel):
    email: str
    password: str 
    name: str

@router.post("/register", status_code=201, response_model=LoginResponse)
async def register(req_register: RegisterRequest, res: Response, session=Depends(get_session)):
    user = session.query(User).filter(User.email == req_register.email).first()
    if user:
        raise HTTPException(status_code=409, detail="User already exists")
    
    user = User(
        email=req_register.email,
        name=req_register.name,
        password_hash=hash_password(req_register.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    access_token, refresh_token = issue_tokens(user.id)
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60,
        path="/"
    )
    return LoginResponse(access_token, user)