from fastapi import APIRouter

from app.api.test_api import router as test_router
from app.features.user.user_api import router as user_router
from app.features.shop.shop_api import router as shop_router
from app.features.checkout.checkout_api import router as checkout_router
from app.features.review.review_api import router as review_router
from app.features.catalogue.catalogue_api import router as catalogue_router
from app.features.admin.admin_api import router as admin_router

router = APIRouter()
router.include_router(test_router)
router.include_router(user_router)
router.include_router(shop_router)
router.include_router(checkout_router)
router.include_router(review_router)
router.include_router(catalogue_router)
router.include_router(admin_router, prefix="/admin")



@router.get("/health")
def getHealth():
    return 200
