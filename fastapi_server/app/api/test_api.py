
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ConfigDict, EmailStr

from app.core import get_config
from app.core.exceptions import AuthorizationException, ConflictException
from app.db.database import Base
from app.features.user.user_service import create_user, update_user, get_user_by_email
from app.features.user.user_api import LoginResponse
from app.api.dependencies import get_session
from app.features.user.auth_service import create_access_token, create_set_password_token, decode_token
from app.utils.to_camel import to_camel

router = APIRouter()


def isTestEnvironment():
    if get_config().environment != "test":
        raise AuthorizationException()

@router.get("/health")
def getHealth():
    return 200

@router.post("/test/reset-db", status_code=200)
def reset_db(request: Request):
    isTestEnvironment()
    engine=request.app.state.db.engine
    with engine.begin() as conn:
        Base.metadata.drop_all(conn)
        Base.metadata.create_all(conn)
    return None

class CreateUserRequest(BaseModel):
    name:str
    email: EmailStr
    password: str
CreateUserResponse = LoginResponse

@router.post("/test/create_user", status_code=201, response_model=CreateUserResponse)
def create_user_route(req:CreateUserRequest, session= Depends(get_session)):
    isTestEnvironment()
    try:
        db_user = create_user(session, req)
        db_user = update_user(session, db_user.id, req)
    
    except ConflictException:
        db_user = get_user_by_email(session, req.email)

    access_token = create_access_token(db_user.id)

    return CreateUserResponse(access_token=access_token, userResponse=db_user)

class SetPasswordTokenRequest(BaseModel):
    email:EmailStr
class SetPasswordTokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)
    set_password_token:str
@router.post("/test/set-password-token", response_model=SetPasswordTokenResponse)
def set_password_token_route(req:SetPasswordTokenRequest, session=Depends(get_session)):
    isTestEnvironment()
    db_user = get_user_by_email(session, req.email)
    set_password_token = create_set_password_token(db_user.id)
    return SetPasswordTokenResponse(set_password_token=set_password_token)