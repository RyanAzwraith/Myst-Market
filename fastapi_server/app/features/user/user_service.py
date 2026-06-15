import bcrypt
import datetime
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
    db_user = session.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise ContentNotFoundException("User Not Found", details={"user_id": user_id})
    return db_user

def get_user_by_email(session, user_email) -> User:
    db_user = session.query(User).filter(User.email == user_email).first()
    if not db_user:
        raise ContentNotFoundException("User Not Found", details={"user_email":user_email})
    return db_user

def create_user(session, data) -> User:
    if session.query(User).filter(User.email == data.email).first():
        raise ConflictException("User with email already exists", details={"user_email": data.email})
    
    db_user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password)
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user

def update_user(session, user_id, data):
    db_user = get_user(session, user_id)

    for key, value in data.model_dump(exclude_unset=True).items():
        strip = value.strip()
        if not strip: 
            continue
        match key:
            case "password": 
                db_user.password_hash = hash_password(value)
            case "name" | "email":
                setattr(db_user, key, value)

    session.commit()
    session.refresh(db_user)
    return db_user

def deactivate_user(session, user_id) -> None:
    db_user = get_user(session, user_id)
    db_user.name = None
    db_user.password = None
    db_user.is_registered = False
    db_user.is_admin = False
    db_user.deleted_at = datetime.now()
    session.commit()