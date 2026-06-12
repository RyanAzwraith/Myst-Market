import bcrypt
from app.db.models import User
from app.core.exceptions import (
    AuthenticationException,
    ContentNotFoundException,
    ConflictException,
    AppError
)
# Logic
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    if not bcrypt.checkpw( password.encode("utf-8"), hashed.encode("utf-8")):
        raise AuthenticationException("Incorrect Password")
    return True
    
# Repo
def get_user(session, user_id) -> User:
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise ContentNotFoundException("User Not Found", details={"user_id": user_id})
    return user

def get_user_by_email(session, user_email) -> User:
    user = session.query(User).filter(User.email == user_email).first()
    if not user:
        raise ContentNotFoundException("User Not Found", details={"user_email":user_email})
    return user

def create_user(session, data) -> User:
    if session.query(User).filter(User.email == data.email).first():
        raise ConflictException("User with email already exists", details={"user_email": data.email})
    
    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password)
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user

def update_user(session, user_id, data):
    user = get_user(session, user_id)

    for key, value in data.model_dump(exclude_unset=True).items():
        match key:
            case "password": 
                user.password_hash = hash_password(value)
            case "name" | "email":
                setattr(user, key, value)

    session.commit()
    session.refresh(user)
    return user

def delete_user(session, user_id) -> None:
    user = get_user(session, user_id)
    session.delete(user)
    session.commit()