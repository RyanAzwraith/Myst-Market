from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response

from app.api.dependencies import (
    get_admin_user,
    get_db,
    get_optional_user,
)
from app.api.paths import Paths
from app.core.Base import Base

from app.features.media.schema import MediaDetail
from app.features.review.schema import Review

from .schema import (
    AdminSearchParams,
    Product,
    ProductAnalytics,
    ProductFields,
    SearchParams,
)


product_router = APIRouter()


# Get Product By Slug
class GetProductBySlugResponse(Base):
    product: Product

@product_router.get(
    Paths.Product.bySlug("{slug}"),
    status_code=200,
    response_model=GetProductBySlugResponse,
)
async def get_product_by_slug_handler(
    slug: str,
    db=Depends(get_db),
):
    product = db.product.get_by_slug(slug)
    return GetProductBySlugResponse(product=product)


# Get Product Image
class GetProductImageResponse(Base):
    media: MediaDetail

@product_router.get(
    Paths.Product.image("{id}"),
    status_code=200,
    response_model=GetProductImageResponse,
)
async def get_product_image_handler(
    id: int,
    db=Depends(get_db),
):
    media = db.media.get_primary("product", id)
    return GetProductImageResponse(media=media)


# Get Product Medias
class GetProductMediasResponse(Base):
    medias: list[MediaDetail]

@product_router.get(
    Paths.Product.medias("{id}"),
    status_code=200,
    response_model=GetProductMediasResponse,
)
async def get_product_medias_handler(
    id: int,
    db=Depends(get_db),
):
    medias = db.media.get_all(entity_type="product", entity_id=id)
    return GetProductMediasResponse(
        medias=medias,
    )


# Get Product Reviews
class GetProductReviewsResponse(Base):
    reviews: list[Review]
    average: float
    user_has_review: bool

@product_router.get(
    Paths.Product.reviews("{id}"),
    status_code=200,
    response_model=GetProductReviewsResponse,
)
async def get_product_reviews_handler(
    id: int,
    user=Depends(get_optional_user),
    db=Depends(get_db),
):
    reviews = db.review.get_for_product(
        id,
        user_id=user.id if user else None,
    )
    return GetProductReviewsResponse(
        reviews=reviews.reviews,
        average=reviews.average,
        user_has_review=reviews.user_has_review,
    )


# Get Product Analytics
class GetProductAnalyticsResponse(Base):
    product: ProductAnalytics

@product_router.get(
    Paths.Product.analytics("{id}"),
    status_code=200,
    response_model=GetProductAnalyticsResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_product_analytics_handler(
    id: int,
    db=Depends(get_db),
):
    product = db.product.get_analytics(id)
    return GetProductAnalyticsResponse(product=product)


# Create Product
class CreateProductRequest(ProductFields):
    pass

@product_router.post(
    Paths.Product.create,
    status_code=201,
    dependencies=[Depends(get_admin_user)],
)
async def create_product_handler(
    req: CreateProductRequest,
    db=Depends(get_db),
):
    db.product.create(
        name=req.name,
        category=req.category_name,
        rarity=req.rarity_name,
        price_aud_cent=req.price_aud_cent,
        slug=req.slug,
        description=req.description,
        stock=req.stock,
    )


# Patch Product
class PatchProductRequest(Base):
    name: str | None = None
    category_name: str | None = None
    rarity_name: str | None = None
    price_aud_cent: int | None = None
    slug: str | None = None
    description: str | None = None
    stock: int | None = None

@product_router.patch(
    Paths.Product.byId("{id}"),
    status_code=204,
    dependencies=[Depends(get_admin_user)],
)
async def patch_product_handler(
    id: int,
    req: PatchProductRequest,
    db=Depends(get_db),
):
    db.product.patch(
        id,
        name=req.name,
        category=req.category_name,
        rarity=req.rarity_name,
        price_aud_cent=req.price_aud_cent,
        slug=req.slug,
        description=req.description,
        stock=req.stock,
    )


# Delete Product
@product_router.delete(
    Paths.Product.byId("{id}"),
    status_code=204,
    dependencies=[Depends(get_admin_user)],
)
async def delete_product_handler(
    id: int,
    db=Depends(get_db),
):
    db.product.delete(id)


products_router = APIRouter()


# Retrieve Featured Products
class RetrieveFeaturedProductsResponse(Base):
    products: list[Product]
    images: list[MediaDetail]

class RetrieveFeaturedProductsRequest(Base):
    limit: int

@products_router.post(
    Paths.Products.featured,
    status_code=200,
    response_model=RetrieveFeaturedProductsResponse,
)
async def retrieve_featured_products_handler(
    req: RetrieveFeaturedProductsRequest,
    db=Depends(get_db),
):
    products = db.product.get_featured(req.limit)
    images = db.media.get_primary_for_many(
        "product",
        [product.id for product in products],
    )
    return RetrieveFeaturedProductsResponse(
        products=products,
        images=images,
    )


# Retrieve Popular Products
class RetrievePopularProductsResponse(Base):
    products: list[Product]
    images: list[MediaDetail]

class RetrievePopularProductsRequest(Base):
    limit: int

@products_router.post(
    Paths.Products.popular,
    status_code=200,
    response_model=RetrievePopularProductsResponse,
)
async def retrieve_popular_products_handler(
    req: RetrievePopularProductsRequest,
    db=Depends(get_db),
):
    products = db.product.get_popular(req.limit)
    return RetrievePopularProductsResponse(
        products=products,
        images=db.media.get_primary_for_many(
            "product",
            [product.id for product in products],
        ),
    )


# Retrieve Newest Products
class RetrieveNewestProductsResponse(Base):
    products: list[Product]
    images: list[MediaDetail]

class RetrieveNewestProductsRequest(Base):
    limit: int

@products_router.post(
    Paths.Products.newest,
    status_code=200,
    response_model=RetrieveNewestProductsResponse,
)
async def retrieve_newest_products_handler(
    req: RetrieveNewestProductsRequest,
    db=Depends(get_db),
):
    products = db.product.get_newest(req.limit)
    images = db.media.get_primary_for_many(
        "product",
        [product.id for product in products],
    )
    return RetrieveNewestProductsResponse(
        products=products,
        images=images,
    )


# Retrieve Most Sold Products
class RetrieveMostSoldProductsResponse(Base):
    products: list[ProductAnalytics]
    images: list[MediaDetail]

class RetrieveMostSoldProductsRequest(Base):
    limit: int

@products_router.post(
    Paths.Products.mostSold,
    status_code=200,
    response_model=RetrieveMostSoldProductsResponse,
)
async def retrieve_most_sold_products_handler(
    req: RetrieveMostSoldProductsRequest,
    db=Depends(get_db),
):
    products = db.product.get_most_sold(req.limit)
    images = db.media.get_primary_for_many(
        "product",
        [product.id for product in products],
    )
    return RetrieveMostSoldProductsResponse(
        products=products,
        images=images,
    )


# Search Products
class SearchProductsResponse(Base):
    products: list[Product]
    images: list[MediaDetail]
    has_more: bool

class SearchProductsRequest(Base):
    search_params: SearchParams | None = None
    limit: int | None = None
    offset: int

@products_router.post(
    Paths.Products.search,
    status_code=200,
    response_model=SearchProductsResponse,
)
async def search_products_handler(
    req: SearchProductsRequest,
    db=Depends(get_db),
):
    search_params = req.search_params
    products, has_more = db.product.search(
        categories=(
            [category.value for category in search_params.categories]
            if search_params and search_params.categories
            else None
        ),
        rarities=(
            [rarity.value for rarity in search_params.rarities]
            if search_params and search_params.rarities
            else None
        ),
        search=search_params.search if search_params else None,
        sort=(
            search_params.sort.value
            if search_params and search_params.sort
            else None
        ),
        is_ascending=(
            search_params.is_ascending
            if search_params
            else None
        ),
        limit=req.limit,
        offset=req.offset,
    )
    images=db.media.get_primary_for_many(
        "product",
        [product.id for product in products],
    )
    return SearchProductsResponse(
        products=products,
        images=images,
        has_more=has_more,
    )


# Admin Search Products
class AdminSearchProductsResponse(Base):
    products: list[ProductAnalytics]
    has_more: bool

class AdminSearchProductsRequest(Base):
    search_params: AdminSearchParams | None = None
    limit: int | None = None
    offset: int | None = None

@products_router.post(
    Paths.Products.searchAdmin, 
    status_code=200,
    response_model=AdminSearchProductsResponse,
    dependencies=[Depends(get_admin_user)],
)
async def admin_search_products_handler(
    req: AdminSearchProductsRequest,
    db=Depends(get_db),
):
    search_params = req.search_params
    products, has_more = db.product.search_admin(
        categories=(
            [category.value for category in search_params.categories]
            if search_params and search_params.categories
            else None
        ),
        rarities=(
            [rarity.value for rarity in search_params.rarities]
            if search_params and search_params.rarities
            else None
        ),
        search=search_params.search if search_params else None,
        is_discontinued=(
            search_params.is_discontinued
            if search_params
            else None
        ),
        sort=(
            search_params.sort.value
            if search_params and search_params.sort
            else None
        ),
        is_ascending=(
            search_params.is_ascending
            if search_params
            else None
        ),
        limit=req.limit,
        offset=req.offset,
    )
    return AdminSearchProductsResponse(
        products=products,
        has_more=has_more,
    )


# Patch Products
class PatchProductsRequest(Base):
    product_ids: list[int] | None = None
    category_name: str | None = None
    rarity_name: str | None = None
    price_aud_cent: int | None = None
    stock: int | None = None

@products_router.patch(
    Paths.Products.all,
    status_code=204,
    dependencies=[Depends(get_admin_user)],
)
async def patch_products_handler(
    req: PatchProductsRequest,
    db=Depends(get_db),
):
    db.product.patch_many(
        req.product_ids or [],
        category=req.category_name,
        rarity=req.rarity_name,
        price_aud_cent=req.price_aud_cent,
        stock=req.stock,
    )
