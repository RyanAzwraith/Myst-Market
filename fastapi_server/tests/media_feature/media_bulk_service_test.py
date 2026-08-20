import csv
import io

import pytest

from app.core.exceptions import ContentNotFoundException, RequestException
from app.features.media import media_bulk_service


def _upload(content: str):
    from fastapi import UploadFile

    return UploadFile(
        file=io.BytesIO(content.encode("utf-8")),
        filename="data.csv",
    )


class read_csv_test:
    def reads_utf8_csv_test(self):
        result = media_bulk_service._read_csv(_upload("id,name\n1,Sword\n"))

        assert list(result) == [{"id": "1", "name": "Sword"}]

    def rejects_invalid_utf8_test(self):
        from fastapi import UploadFile

        upload = UploadFile(
            file=io.BytesIO(b"id,name\n1,\xff"),
            filename="data.csv",
        )

        with pytest.raises(RequestException):
            media_bulk_service._read_csv(upload)


class row_data_test:
    def row_data_excludes_id_test(self):
        row = {"id": "1", "name": "Sword", "stock": "2"}

        result = media_bulk_service._row_data(row, ("id", "name", "stock"))

        assert result == {"name": "Sword", "stock": "2"}


class row_error_test:
    def row_error_from_validation_error_test(self):
        from pydantic import ValidationError
        from app.features.admin.admin_schema import PostSaleRequest

        with pytest.raises(ValidationError) as raised:
            PostSaleRequest.model_validate({})

        result = media_bulk_service._row_error(4, raised.value)

        assert result.row == 4
        assert result.field == "name"

    def row_error_from_domain_error_test(self):
        error = ContentNotFoundException("Product Not Found")

        result = media_bulk_service._row_error(5, error)

        assert result.row == 5
        assert "Product Not Found" in result.message


class product_change_detection_test:
    def detects_product_changes_test(self, product, stock):
        from app.features.admin.admin_schema import PatchProductRequest

        request = PatchProductRequest(name="Changed")

        assert media_bulk_service._product_changed(product, request)

    def accepts_unchanged_product_test(self, product, stock):
        from app.features.admin.admin_schema import PatchProductRequest

        request = PatchProductRequest(
            name=product.name,
            category_name=product.category.name,
            rarity_name=product.rarity.name,
            price_aud_cent=product.price_aud_cent,
            slug=product.slug,
            description=product.description,
            stock=stock.current,
        )

        assert not media_bulk_service._product_changed(product, request)


class sale_change_detection_test:
    def detects_sale_changes_test(self, sale):
        from app.features.admin.admin_schema import PatchSaleRequest

        request = PatchSaleRequest(name="Changed")

        assert media_bulk_service._sale_changed(sale, request)

    def accepts_unchanged_sale_test(self, sale):
        from app.features.admin.admin_schema import PatchSaleRequest

        request = PatchSaleRequest(
            name=sale.name,
            slug=sale.slug,
            description=sale.description,
            start_at=sale.start_at,
            end_at=sale.end_at,
            discount_percent=sale.discount_percent,
        )

        assert not media_bulk_service._sale_changed(sale, request)


class export_products_csv_test:
    def exports_product_fields_test(self, session, product, stock):
        result = media_bulk_service.export_products_csv(session)
        rows = list(csv.DictReader(io.StringIO(result.getvalue())))

        assert rows == [
            {
                "id": str(product.id),
                "name": product.name,
                "category_name": product.category.name,
                "rarity_name": product.rarity.name,
                "price_aud_cent": str(product.price_aud_cent),
                "slug": product.slug,
                "description": product.description,
                "stock": str(stock.current),
            }
        ]


class export_sales_csv_test:
    def exports_sale_fields_test(self, session, sale):
        result = media_bulk_service.export_sales_csv(session)
        rows = list(csv.DictReader(io.StringIO(result.getvalue())))

        assert rows == [
            {
                "id": str(sale.id),
                "name": sale.name,
                "slug": sale.slug,
                "description": sale.description,
                "discount_percent": str(sale.discount_percent),
                "start_at": sale.start_at.isoformat(),
                "end_at": sale.end_at.isoformat(),
            }
        ]


class import_products_csv_test:
    def creates_updates_and_reports_missing_rows_test(
        self,
        session,
        product,
        category,
        rarity,
    ):
        content = (
            "id,name,category_name,rarity_name,price_aud_cent,slug,"
            "description,stock\n"
            f",New Product,{category.name},{rarity.name},1200,new-product,"
            "New description,6\n"
            f"{product.id},Updated Product,{category.name},{rarity.name},2200,"
            "updated-product,Updated description,8\n"
            "999,Missing,Artifacts,Common,100,missing,Missing,1\n"
        )

        result = media_bulk_service.import_products_csv(
            session,
            _upload(content),
        )

        assert result.imported == 1
        assert result.updated == 1
        assert result.failed == 1
        assert session.query(type(product)).filter_by(name="New Product").first()
        session.refresh(product)
        assert product.name == "Updated Product"
        assert product.price_aud_cent == 2200


class import_sales_csv_test:
    def creates_and_updates_sales_test(self, session, sale):
        new_start = sale.start_at.isoformat()
        new_end = sale.end_at.isoformat()
        content = (
            "id,name,slug,description,discount_percent,start_at,end_at\n"
            f",New Sale,new-sale,New description,15,{new_start},{new_end}\n"
            f"{sale.id},Updated Sale,updated-sale,Updated description,25,"
            f"{new_start},{new_end}\n"
        )

        result = media_bulk_service.import_sales_csv(session, _upload(content))

        assert result.imported == 1
        assert result.updated == 1
        session.refresh(sale)
        assert sale.name == "Updated Sale"
        assert sale.discount_percent == 25
        assert session.query(type(sale)).filter_by(name="New Sale").first()
