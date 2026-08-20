from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

from app.api.dependencies import get_session

from .media_schema import (
    CsvImportResponse,
    EntityType,
    GetProductMediaResponse,
    GetSaleMediaResponse,
    RetrieveProductsMediaRequest,
    RetrieveProductsMediaResponse,
    RetrieveSalesMediaRequest,
    RetrieveSalesMediaResponse,
)
from .media_service import (
    get_media_file,
    get_product_media,
    get_products_media,
    get_sale_media,
    get_sales_media,
)
from .media_bulk_service import (
    export_products_csv,
    export_sales_csv,
    import_products_csv,
    import_sales_csv,
)


router = APIRouter()


@router.get(
    "/products/{product_id}/media",
    status_code=200,
    response_model=GetProductMediaResponse,
)
async def get_product_media_route(
    product_id: int,
    session=Depends(get_session),
):
    return GetProductMediaResponse(
        media=get_product_media(session, product_id),
    )


@router.post(
    "/products/media",
    status_code=200,
    response_model=RetrieveProductsMediaResponse,
)
async def retrieve_products_media_route(
    req: RetrieveProductsMediaRequest,
    session=Depends(get_session),
):
    return RetrieveProductsMediaResponse(
        media=get_products_media(session, req.product_ids),
    )


@router.get(
    "/sales/{sale_id}/media",
    status_code=200,
    response_model=GetSaleMediaResponse,
)
async def get_sale_media_route(
    sale_id: int,
    session=Depends(get_session),
):
    return GetSaleMediaResponse(media=get_sale_media(session, sale_id))


@router.post(
    "/sales/media",
    status_code=200,
    response_model=RetrieveSalesMediaResponse,
)
async def retrieve_sales_media_route(
    req: RetrieveSalesMediaRequest,
    session=Depends(get_session),
):
    return RetrieveSalesMediaResponse(
        media=get_sales_media(session, req.sale_ids),
    )


@router.get("/media/{entity_type}/{file_name}", response_class=FileResponse)
async def get_media_file_route(entity_type: EntityType, file_name: str):
    path, media_type = get_media_file(entity_type, file_name)
    return FileResponse(path, media_type=media_type)


@router.get("/products/export")
async def export_products_route(session=Depends(get_session)):
    output = export_products_csv(session)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.get("/sales/export")
async def export_sales_route(session=Depends(get_session)):
    output = export_sales_csv(session)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales.csv"},
    )


@router.post("/products/import", response_model=CsvImportResponse)
async def import_products_route(
    file: UploadFile = File(...),
    session=Depends(get_session),
):
    return import_products_csv(session, file)


@router.post("/sales/import", response_model=CsvImportResponse)
async def import_sales_route(
    file: UploadFile = File(...),
    session=Depends(get_session),
):
    return import_sales_csv(session, file)
