from fastapi import APIRouter

from app.features.media.api import media_router
from app.features.auth.api import auth_router
from app.features.app.api import app_router
from app.features.item.api import items_router
from app.features.order.api import order_router, orders_router, stripe_router
from app.features.product.api import product_router, products_router
from app.features.review.api import review_router, reviews_router
from app.features.sale.api import sale_router, sales_router
from app.features.user.api import user_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(app_router)
router.include_router(items_router)
router.include_router(orders_router)
router.include_router(order_router)
router.include_router(stripe_router)
router.include_router(user_router)
router.include_router(sale_router)
router.include_router(sales_router)
router.include_router(product_router)
router.include_router(products_router)
router.include_router(review_router)
router.include_router(reviews_router)
router.include_router(media_router)

@router.get("/health")
def getHealth():
    return 200


