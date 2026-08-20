import csv
import io

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.exceptions import ContentNotFoundException, RequestException
from app.db.models import Product, Sale
from app.features.admin.admin_products_service import (
    create_product,
    patch_product,
)
from app.features.admin.admin_sales_service import create_sale, patch_sale
from app.features.admin.admin_schema import (
    PatchProductRequest,
    PatchSaleRequest,
    PostProductRequest,
    PostSaleRequest,
)

from .media_schema import CsvImportError, CsvImportResponse


_PRODUCT_FIELDS = (
    "id",
    "name",
    "category_name",
    "rarity_name",
    "price_aud_cent",
    "slug",
    "description",
    "stock",
)
_SALE_FIELDS = (
    "id",
    "name",
    "slug",
    "description",
    "discount_percent",
    "start_at",
    "end_at",
)


def _read_csv(upload: UploadFile) -> csv.DictReader:
    try:
        text = upload.file.read().decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise RequestException("CSV file must be UTF-8 encoded") from exc
    return csv.DictReader(io.StringIO(text))


def _row_data(row: dict[str, str | None], fields: tuple[str, ...]):
    return {field: row.get(field) for field in fields if field != "id"}


def _row_error(row_number: int, error: Exception) -> CsvImportError:
    if isinstance(error, ValidationError):
        details = error.errors()[0]
        field = ".".join(str(value) for value in details["loc"])
        return CsvImportError(
            row=row_number,
            field=field or None,
            message=details["msg"],
        )
    return CsvImportError(row=row_number, message=str(error))


def _product_changed(product: Product, request: PatchProductRequest) -> bool:
    values = {
        "name": product.name,
        "category_name": product.category.name,
        "rarity_name": product.rarity.name,
        "price_aud_cent": product.price_aud_cent,
        "slug": product.slug,
        "description": product.description,
        "stock": product.stock.current if product.stock else None,
    }
    return any(
        value is not None and value != values[field]
        for field, value in request.model_dump().items()
    )


def _sale_changed(sale: Sale, request: PatchSaleRequest) -> bool:
    values = {
        "name": sale.name,
        "slug": sale.slug,
        "description": sale.description,
        "start_at": sale.start_at,
        "end_at": sale.end_at,
        "discount_percent": sale.discount_percent,
    }
    return any(
        value is not None and value != values[field]
        for field, value in request.model_dump().items()
    )


def _rollback_pending_changes(session: Session) -> None:
    if session.new or session.dirty or session.deleted:
        session.rollback()


def export_products_csv(session: Session) -> io.StringIO:
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=_PRODUCT_FIELDS)
    writer.writeheader()
    products = session.query(Product).order_by(Product.id).all()
    for product in products:
        writer.writerow(
            {
                "id": product.id,
                "name": product.name,
                "category_name": product.category.name,
                "rarity_name": product.rarity.name,
                "price_aud_cent": product.price_aud_cent,
                "slug": product.slug,
                "description": product.description or "",
                "stock": product.stock.current if product.stock else 0,
            }
        )
    output.seek(0)
    return output


def export_sales_csv(session: Session) -> io.StringIO:
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=_SALE_FIELDS)
    writer.writeheader()
    sales = session.query(Sale).order_by(Sale.id).all()
    for sale in sales:
        writer.writerow(
            {
                "id": sale.id,
                "name": sale.name,
                "slug": sale.slug,
                "description": sale.description or "",
                "discount_percent": sale.discount_percent,
                "start_at": sale.start_at.isoformat(),
                "end_at": sale.end_at.isoformat(),
            }
        )
    output.seek(0)
    return output


def import_products_csv(
    session: Session,
    upload: UploadFile,
) -> CsvImportResponse:
    imported = 0
    updated = 0
    errors: list[CsvImportError] = []
    rows = _read_csv(upload)
    for row_number, row in enumerate(rows, start=2):
        try:
            row_data = _row_data(row, _PRODUCT_FIELDS)
            id_value = (row.get("id") or "").strip()
            if id_value:
                product_id = int(id_value)
                product = (
                    session.query(Product).filter(Product.id == product_id).first()
                )
                if not product:
                    raise ContentNotFoundException(
                        "Product Not Found",
                        details={"product_id": product_id},
                    )
                request = PatchProductRequest.model_validate(row_data)
                if _product_changed(product, request):
                    patch_product(session, product_id, request)
                    updated += 1
            else:
                create_product(
                    session,
                    PostProductRequest.model_validate(row_data),
                )
                imported += 1
        except (ContentNotFoundException, ValueError, ValidationError) as exc:
            _rollback_pending_changes(session)
            errors.append(_row_error(row_number, exc))
    return CsvImportResponse(
        imported=imported,
        updated=updated,
        failed=len(errors),
        errors=errors,
    )


def import_sales_csv(session: Session, upload: UploadFile) -> CsvImportResponse:
    imported = 0
    updated = 0
    errors: list[CsvImportError] = []
    rows = _read_csv(upload)
    for row_number, row in enumerate(rows, start=2):
        try:
            row_data = _row_data(row, _SALE_FIELDS)
            id_value = (row.get("id") or "").strip()
            if id_value:
                sale_id = int(id_value)
                sale = session.query(Sale).filter(Sale.id == sale_id).first()
                if not sale:
                    raise ContentNotFoundException(
                        "Sale Not Found",
                        details={"sale_id": sale_id},
                    )
                request = PatchSaleRequest.model_validate(row_data)
                if _sale_changed(sale, request):
                    patch_sale(session, sale_id, request)
                    updated += 1
            else:
                create_sale(
                    session,
                    PostSaleRequest.model_validate(row_data),
                )
                imported += 1
        except (ContentNotFoundException, ValueError, ValidationError) as exc:
            _rollback_pending_changes(session)
            errors.append(_row_error(row_number, exc))
    return CsvImportResponse(
        imported=imported,
        updated=updated,
        failed=len(errors),
        errors=errors,
    )
