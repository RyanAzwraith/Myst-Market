from fastapi import APIRouter, Depends, Response

from app.api.paths import Paths
from app.core.Base import Base
from app.api.dependencies import (
    get_admin_user,
    get_current_user,
    get_db,
    get_set_password_user,
)
from app.core.exceptions import AuthorizationException
from app.features.auth import hash_password, issue_tokens

from app.features.order.schema import Order, OrderSummary
from app.features.review.schema import Review

from .schema import (
    AdminSearchParams, 
    User, 
    UserAnalytics, 
    UserInput, 
    UserPatch
)
from .service import send_set_password_email

user_router = APIRouter()


# Get User Reviews
class GetUserReviewsResponse(Base):
    reviews: list[Review]

@user_router.get(
    Paths.User.reviews,
    status_code=200,
    response_model=GetUserReviewsResponse,
    dependencies=[Depends(get_current_user)],
)
async def get_user_reviews_handler(
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    reviews = db.review.get_for_user(user.id)
    return GetUserReviewsResponse(reviews=reviews)


# Get User Order
class GetUserOrderResponse(Base):
    order: Order

@user_router.get(
    Paths.User.order("{orderId}"),
    status_code=200,
    response_model=GetUserOrderResponse,
    dependencies=[Depends(get_current_user)],
)
async def get_user_order_handler(
    orderId: int,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    order = db.order.get(orderId)
    if order.user_id != user.id:
        raise AuthorizationException("Order does not belong to user")
    return GetUserOrderResponse(order=order)


# Get User Orders
class GetUserOrdersResponse(Base):
    orders: list[OrderSummary]

@user_router.get(
    Paths.User.orders,
    status_code=200,
    response_model=GetUserOrdersResponse,
    dependencies=[Depends(get_current_user)],
)
async def get_user_orders_handler(
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    orders = db.order.get_all(user_id=user.id)
    return GetUserOrdersResponse(orders=orders)


# Get User Analytics
class GetUserAnalyticsResponse(Base):
    user: UserAnalytics

@user_router.get(
    Paths.User.analytics("{userId}"),
    status_code=200,
    response_model=GetUserAnalyticsResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_user_analytics_handler(
    userId: int,
    db=Depends(get_db),
):
    user = db.user.get_analytics(userId)
    return GetUserAnalyticsResponse(user=user)


# Create User
class CreateUserRequest(Base):
    user_input: UserInput

@user_router.post(
    Paths.User.create,
    status_code=201,
)
async def create_user_handler(
    req: CreateUserRequest,
    db=Depends(get_db),
):
    user = db.user.create(
        email=req.user_input.email,
        name=req.user_input.name,
        is_registered=True,
    )
    send_set_password_email(user)


# Patch User
class PatchUserResponse(Base):
    user: User


class PatchUserRequest(Base):
    user_input: UserPatch

@user_router.patch(
    Paths.User.me,
    status_code=200,
    response_model=PatchUserResponse,
    dependencies=[Depends(get_current_user)],
)
async def patch_user_handler(
    req: PatchUserRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    user = db.user.patch(
        user.id,
        email=req.user_input.email,
        name=req.user_input.name,
    )
    return PatchUserResponse(user=user)


# Patch User Password
class PatchUserPasswordResponse(Base):
    access_token: str
    user: User

class PatchUserPasswordRequest(Base):
    password: str

@user_router.patch(
    Paths.User.password,
    status_code=200,
    response_model=PatchUserPasswordResponse,
    dependencies=[Depends(get_set_password_user)],
)
async def patch_user_password_handler(
    req: PatchUserPasswordRequest,
    res: Response,
    user=Depends(get_set_password_user),
    db=Depends(get_db),
):
    user = db.user.patch(
        user.id,
        password_hash=hash_password(req.password),
    )
    access_token = issue_tokens(res, user.id)
    return PatchUserPasswordResponse(
        access_token=access_token,
        user=user,
    )


# Send User Password Email
@user_router.post(
    Paths.User.passwordEmail,
    status_code=200,
    dependencies=[Depends(get_current_user)],
)
async def send_user_password_email_handler(
    user=Depends(get_current_user),
):
    send_set_password_email(user)


# Delete User
@user_router.delete(
    Paths.User.me,
    status_code=204,
    dependencies=[Depends(get_current_user)],
)
async def delete_user_handler(
    res: Response,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    db.user.delete(user.id)
    res.delete_cookie("refresh_token", path="/")


# Admin Search Users
class AdminSearchUsersResponse(Base):
    users: list[UserAnalytics]
    has_more: bool

class AdminSearchUsersRequest(Base):
    search_params: AdminSearchParams | None = None
    limit: int | None = None
    offset: int

@user_router.post(
    Paths.Users.searchAdmin,
    status_code=200,
    response_model=AdminSearchUsersResponse,
    dependencies=[Depends(get_admin_user)],
)
async def admin_search_users_handler(
    req: AdminSearchUsersRequest,
    db=Depends(get_db),
):
    search_params = req.search_params
    users, has_more = db.user.search(
        search=search_params.search if search_params else None,
        registrations=(
            [registration.value for registration in search_params.registration]
            if search_params
            else None
        ),
        sort_by=search_params.sort_by.value if search_params else None,
        is_ascending=search_params.is_ascending if search_params else None,
        limit=req.limit,
        offset=req.offset,
    )
    return AdminSearchUsersResponse(users=users, has_more=has_more)