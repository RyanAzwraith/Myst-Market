from datetime import date

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response

from app.api.dependencies import (
    get_admin_user,
    get_db,
)
from app.api.paths import Paths
from app.core.Base import Base
from app.features.media.schema import MediaDetail

from .schema import (
    AdminSearchParams,
    Sale,
    SaleAnalytics,
    SaleInput,
)

sale_router = APIRouter()


# Get Sale By Slug
class GetSaleBySlugResponse(Base):
    sale: Sale

@sale_router.get(
    Paths.Sale.bySlug("{slug}"),
    status_code=200,
    response_model=GetSaleBySlugResponse,
)
async def get_sale_by_slug_handler(
    slug: str,
    db=Depends(get_db),
):
    sale = db.sale.get_by_slug(slug)
    return GetSaleBySlugResponse(sale=sale)


# Get Sale Image
class GetSaleImageResponse(Base):
    media: MediaDetail

@sale_router.get(
    Paths.Sale.image("{id}"),
    status_code=200,
    response_model=GetSaleImageResponse,
)
async def get_sale_image_handler(
    id: int,
    db=Depends(get_db),
):
    media = db.media.get_primary("sale", id)
    return GetSaleImageResponse(media=media)


# Get Sale Medias
class GetSaleMediasResponse(Base):
    medias: list[MediaDetail]

@sale_router.get(
    Paths.Sale.medias("{id}"),
    status_code=200,
    response_model=GetSaleMediasResponse,
)
async def get_sale_medias_handler(
    id: int,
    db=Depends(get_db),
):
    medias = db.media.get_all(entity_type="sale", entity_id=id)
    return GetSaleMediasResponse(
        medias=medias,
    )


# Get Sale Analytics
class GetSaleAnalyticsResponse(Base):
    sale: SaleAnalytics

@sale_router.get(
    Paths.Sale.analytics("{id}"),
    status_code=200,
    response_model=GetSaleAnalyticsResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_sale_analytics_handler(
    id: int,
    db=Depends(get_db),
):
    sale = db.sale.get_analytics(id)
    return GetSaleAnalyticsResponse(sale=sale)


# Create Sale
class CreateSaleRequest(SaleInput):
    pass

@sale_router.post(
    Paths.Sale.create,
    status_code=201,
    response_model=None,
    dependencies=[Depends(get_admin_user)],
)
async def post_sale_handler(
    req: CreateSaleRequest,
    db=Depends(get_db),
):
    db.sale.create(
        discount_perc=req.discount_perc,
        start_at=req.start_at,
        end_at=req.end_at,
        name=req.name,
        slug=req.slug,
        description=req.description,
    )


# Patch Sale
class PatchSaleRequest(Base):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    start_at: date | None = None
    end_at: date | None = None
    discount_percent: int | None = None

@sale_router.patch(
    Paths.Sale.byId("{id}"),
    status_code=204,
    response_model=None,
    dependencies=[Depends(get_admin_user)],
)
async def patch_sale_handler(
    id: int,
    req: PatchSaleRequest,
    db=Depends(get_db),
):
    db.sale.patch(
        id,
        name=req.name,
        slug=req.slug,
        description=req.description,
        start_at=req.start_at,
        end_at=req.end_at,
        discount_perc=req.discount_percent,
    )


# Delete Sale
@sale_router.delete(
    Paths.Sale.byId("{id}"),
    status_code=204,
    response_model=None,
    dependencies=[Depends(get_admin_user)],
)
async def delete_sale_handler(
    id: int,
    db=Depends(get_db),
):
    db.sale.delete(id)


sales_router = APIRouter()


# Get All Sales
class GetSalesResponse(Base):
    sales: list[Sale]

@sales_router.get(
    Paths.Sales.all,
    status_code=200,
    response_model=GetSalesResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_sales_handler(
    db=Depends(get_db),
):
    sales = db.sale.get_all()
    return GetSalesResponse(sales=sales)


# Retrieve Biggest Sales
class RetrieveBiggestSalesResponse(Base):
    sales: list[Sale]
    images: list[MediaDetail]

class RetrieveBiggestSalesRequest(Base):
    limit: int

@sales_router.post(
    Paths.Sales.biggest,
    status_code=200,
    response_model=RetrieveBiggestSalesResponse,
)
async def post_biggest_sales_handler(
    req: RetrieveBiggestSalesRequest,
    db=Depends(get_db),
):
    sales = db.sale.get_biggest(req.limit)
    images = db.media.get_primary_for_many(
        "sale",
        [sale.id for sale in sales],
    )
    return RetrieveBiggestSalesResponse(sales=sales, images=images)


# Admin Search Sales
class AdminSearchSalesResponse(Base):
    sales: list[SaleAnalytics]
    has_more: bool

class AdminSearchSalesRequest(Base):
    search_params: AdminSearchParams | None = None
    limit: int | None = None
    offset: int

@sales_router.post(
    Paths.Sales.searchAdmin,
    status_code=200,
    response_model=AdminSearchSalesResponse,
    dependencies=[Depends(get_admin_user)],
)
async def post_admin_search_sales_handler(
    req: AdminSearchSalesRequest,
    db=Depends(get_db),
):
    search_params = req.search_params
    sales, has_more = db.sale.search_admin(
        search=search_params.search if search_params else None,
        activations=(
            [activation.value for activation in search_params.activation]
            if search_params
            else None
        ),
        sort_by=search_params.sort.value if search_params else None,
        is_ascending=(
            search_params.is_ascending if search_params else None
        ),
        limit=req.limit,
        offset=req.offset,
    )
    return AdminSearchSalesResponse(sales=sales, has_more=has_more)


# Patch Sales
class PatchSalesRequest(Base):
    ids: list[int]
    start_at: date | None = None
    end_at: date | None = None
    discount_percent: int | None = None

@sales_router.patch(
    Paths.Sales.all,
    status_code=204,
    response_model=None,
    dependencies=[Depends(get_admin_user)],
)
async def patch_sales_handler(
    req: PatchSalesRequest,
    db=Depends(get_db),
):
    db.sale.patch_many(
        req.ids,
        start_at=req.start_at,
        end_at=req.end_at,
        discount_perc=req.discount_percent,
    )
