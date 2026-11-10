
from fastapi import APIRouter, Depends
from app.api.paths import Paths


from app.core import (
    get_config,
    AuthorizationException,
    ConflictException,
)
from app.core.Base import Base
from app.api.dependencies import get_db
from app.features.auth import (
    create_access_token, 
    create_set_password_token, 
    hash_password
)
from app.features.user import User
from app.implementations.database.sqlite.seed import seed_database

test_router = APIRouter()

def isTestEnvironment():
    if get_config().environment != "test":
        raise AuthorizationException()


# Health Check Route
@test_router.get("/health")
def getHealth():
    return 200


# Reset Database Route
@test_router.post(
    Paths.Test.resetDb, 
    status_code=200
)
def reset_db():
    isTestEnvironment()
    test_db_url = get_config().database_url
    seed_database(test_db_url, 420)


# Create User Route
class CreateUserRequest(Base):
    name:str
    email: str
    password: str

class CreateUserResponse(Base):
    access_token: str
    user: User

@test_router.post(
    Paths.Test.createUser, 
    status_code=201, 
    response_model=CreateUserResponse
)
def create_user_route(
    req:CreateUserRequest, 
    db = Depends(get_db)
):
    isTestEnvironment()
    try:
        user = db.user.create(
            email=req.email,
            name=req.name,
            is_registered=True,
            password_hash=hash_password(req.password)
        )
    except ConflictException:
        user = db.user.get_by_email(req.email)

    access_token = create_access_token(user.id)
    return CreateUserResponse(
        access_token=access_token, 
        user=user
    )


# Set Password Token Route
class SetPasswordTokenRequest(Base):
    email:str

class SetPasswordTokenResponse(Base):
    set_password_token:str

@test_router.post(
    Paths.Test.setPasswordToken, 
    response_model=SetPasswordTokenResponse
)
def set_password_token_route(
    req:SetPasswordTokenRequest, 
    db=Depends(get_db)
):
    isTestEnvironment()
    user = db.user.get_by_email(req.email)
    set_password_token = create_set_password_token(user.id)
    return SetPasswordTokenResponse(
        set_password_token=set_password_token
    )