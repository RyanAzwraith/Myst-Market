from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel, ConfigDict
import bcrypt

from app.core import get_session
from app.db.models import User
from app.core.exceptions import ContentNotFound


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    
class UserUpdate(BaseModel):
    email: str | None = None
    name: str | None = None
    password: str | None = None  
    
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    is_admin: bool
    is_registered: bool
    name: str

router = APIRouter(prefix="/user")

@router.post("", status_code=201, response_model=UserResponse)
async def postUser(user_req: UserCreate, session=Depends(get_session)):
    db_user = User(
        email=user_req.email,
        name=user_req.name,
        password_hash=hash_password(user_req.password)
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.get("/{user_id}", status_code=200, response_model=UserResponse)
async def get(user_id: int, session=Depends(get_session)):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ContentNotFound()
    return user

@router.patch("/{user_id}", status_code=200, response_model=UserResponse)
async def patch_user(
    user_id: int,
    user_req: UserUpdate,
    session=Depends(get_session),
):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ContentNotFound()

    data = user_req.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "password":
            user.password_hash = hash_password(value)
        else:
            setattr(user, key, value)

    session.commit()
    session.refresh(user)
    return user

@router.delete("/{user_id}", status_code=204)
async def deleteUser(user_id, session=Depends(get_session)):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ContentNotFound()
    
    session.delete(user)
    session.commit()
    return None

    
