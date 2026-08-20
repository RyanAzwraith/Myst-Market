import io

import pytest
from fastapi import UploadFile

from app.features.media.media_api import (
    export_products_route,
    export_sales_route,
    get_media_file_route,
    get_product_media_route,
    get_sale_media_route,
    import_products_route,
    import_sales_route,
    retrieve_products_media_route,
    retrieve_sales_media_route,
)
from app.features.media.media_schema import (
    RetrieveProductsMediaRequest,
    RetrieveSalesMediaRequest,
)


async def _response_text(response):
    chunks = []
    async for chunk in response.body_iterator:
        chunks.append(chunk)
    return b"".join(
        chunk if isinstance(chunk, bytes) else chunk.encode("utf-8") for chunk in chunks
    ).decode("utf-8")


def _upload(content: str):
    return UploadFile(
        file=io.BytesIO(content.encode("utf-8")),
        filename="data.csv",
    )


class get_product_media_route_test:
    @pytest.mark.asyncio
    async def returns_product_media_test(self, session, product, product_media):
        result = await get_product_media_route(product.id, session)

        assert len(result.media) == 1
        assert result.media[0].id == product_media.id


class retrieve_products_media_route_test:
    @pytest.mark.asyncio
    async def returns_primary_media_by_product_test(
        self,
        session,
        product,
        media_factory,
    ):
        media_factory(
            entity_id=product.id,
            file_name="later.jpg",
            sort_order=3,
        )
        primary = media_factory(
            entity_id=product.id,
            file_name="primary.jpg",
            sort_order=1,
        )

        result = await retrieve_products_media_route(
            RetrieveProductsMediaRequest(product_ids=[product.id]),
            session,
        )

        assert result.media[product.id].id == primary.id


class get_sale_media_route_test:
    @pytest.mark.asyncio
    async def returns_sale_media_test(self, session, sale, sale_media):
        result = await get_sale_media_route(sale.id, session)

        assert len(result.media) == 1
        assert result.media[0].id == sale_media.id


class retrieve_sales_media_route_test:
    @pytest.mark.asyncio
    async def returns_primary_media_by_sale_test(
        self,
        session,
        sale,
        media_factory,
    ):
        media_factory(
            entity_id=sale.id,
            entity_type="sale",
            file_name="later-sale.jpg",
            sort_order=3,
        )
        primary = media_factory(
            entity_id=sale.id,
            entity_type="sale",
            file_name="primary-sale.jpg",
            sort_order=1,
        )

        result = await retrieve_sales_media_route(
            RetrieveSalesMediaRequest(sale_ids=[sale.id]),
            session,
        )

        assert result.media[sale.id].id == primary.id


class get_media_file_route_test:
    @pytest.mark.asyncio
    async def returns_file_response_test(self, product_media):
        result = await get_media_file_route(
            "product",
            product_media.file_name,
        )

        assert result.media_type == "image/jpeg"
        assert result.path.name == product_media.file_name


class export_products_route_test:
    @pytest.mark.asyncio
    async def streams_product_csv_test(self, session, product):
        result = await export_products_route(session)
        text = await _response_text(result)

        assert result.media_type == "text/csv"
        assert "category_name" in text
        assert product.name in text


class export_sales_route_test:
    @pytest.mark.asyncio
    async def streams_sale_csv_test(self, session, sale):
        result = await export_sales_route(session)
        text = await _response_text(result)

        assert result.media_type == "text/csv"
        assert "discount_percent" in text
        assert sale.name in text


class import_products_route_test:
    @pytest.mark.asyncio
    async def imports_product_csv_test(
        self,
        session,
        category,
        rarity,
    ):
        content = (
            "id,name,category_name,rarity_name,price_aud_cent,slug,"
            "description,stock\n"
            f",Imported Product,{category.name},{rarity.name},1500,imported,"
            "Imported description,3\n"
        )

        result = await import_products_route(_upload(content), session)

        assert result.imported == 1
        assert result.failed == 0


class import_sales_route_test:
    @pytest.mark.asyncio
    async def imports_sale_csv_test(self, session, sale):
        content = (
            "id,name,slug,description,discount_percent,start_at,end_at\n"
            f",Imported Sale,imported-sale,Imported description,15,"
            f"{sale.start_at.isoformat()},{sale.end_at.isoformat()}\n"
        )

        result = await import_sales_route(_upload(content), session)

        assert result.imported == 1
        assert result.failed == 0
