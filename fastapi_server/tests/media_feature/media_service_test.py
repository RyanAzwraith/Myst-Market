import pytest

from app.core.exceptions import ContentNotFoundException, ValidationException
from app.db.models import Media
from app.features.media import media_service


class media_root_test:
    def media_root_creates_entity_directories_test(self, media_root):
        result = media_service._media_root()

        assert result == media_root
        assert (media_root / "product").is_dir()
        assert (media_root / "sale").is_dir()


class entity_directory_test:
    def entity_directory_test(self):
        assert media_service._entity_directory("product") == "product"
        assert media_service._entity_directory("sale") == "sale"

        with pytest.raises(ValidationException):
            media_service._entity_directory("unknown")


class media_path_test:
    def media_path_rejects_path_components_test(self, media_root):
        with pytest.raises(ValidationException):
            media_service._media_path("product", "../image.jpg")


class media_url_test:
    def returns_direct_media_url_test(self, product_media):
        result = media_service._media_url(product_media)

        assert result == (f"/media/product/{product_media.file_name}")


class media_detail_test:
    def converts_media_row_test(self, product_media):
        result = media_service._media_detail(product_media)

        assert result.id == product_media.id
        assert result.media_url.endswith(product_media.file_name)


class get_product_media_test:
    def returns_sorted_product_media_test(
        self,
        session,
        product,
        media_factory,
    ):
        media_factory(
            entity_id=product.id,
            file_name="late.jpg",
            sort_order=3,
        )
        first = media_factory(
            entity_id=product.id,
            file_name="first.jpg",
            sort_order=1,
        )

        result = media_service.get_product_media(session, product.id)

        assert [item.id for item in result] == [first.id, first.id - 1]
        assert result[0].media_url.endswith("first.jpg")

    def returns_empty_for_unknown_product_test(self, session):
        assert media_service.get_product_media(session, 999) == []


class get_primary_media_test:
    def selects_one_lowest_sorted_row_per_entity_test(
        self,
        session,
        shop_seed,
        media_factory,
    ):
        first_product = shop_seed["products"][0]
        second_product = shop_seed["products"][1]
        first = media_factory(
            entity_id=first_product.id,
            file_name="first.jpg",
            sort_order=2,
        )
        best = media_factory(
            entity_id=first_product.id,
            file_name="best.jpg",
            sort_order=1,
        )
        other = media_factory(
            entity_id=second_product.id,
            file_name="other.jpg",
            sort_order=0,
        )

        result = media_service._get_primary_media(
            session,
            "product",
            [first_product.id, second_product.id],
        )

        assert {media.id for media in result} == {best.id, other.id}
        assert first.id not in {media.id for media in result}

    def empty_ids_does_not_return_rows_test(self, session):
        assert media_service._get_primary_media(session, "product", []) == []


class get_products_media_test:
    def returns_one_media_detail_per_product_test(
        self,
        session,
        product,
        media_factory,
    ):
        media_factory(
            entity_id=product.id,
            file_name="later.jpg",
            sort_order=4,
        )
        media_factory(
            entity_id=product.id,
            file_name="primary.jpg",
            sort_order=0,
        )

        result = media_service.get_products_media(session, [product.id, 999])

        assert list(result) == [product.id]
        assert result[product.id].media_url.endswith("primary.jpg")


class get_sale_media_test:
    def returns_sorted_sale_media_test(
        self,
        session,
        sale,
        media_factory,
    ):
        media_factory(
            entity_id=sale.id,
            entity_type="sale",
            file_name="later-sale.jpg",
            sort_order=2,
        )
        first = media_factory(
            entity_id=sale.id,
            entity_type="sale",
            file_name="first-sale.jpg",
            sort_order=1,
        )

        result = media_service.get_sale_media(session, sale.id)

        assert result[0].id == first.id
        assert result[0].media_url.endswith("first-sale.jpg")

    def returns_empty_for_unknown_sale_test(self, session):
        assert media_service.get_sale_media(session, 999) == []


class get_sales_media_test:
    def returns_one_media_detail_per_sale_test(
        self,
        session,
        sale,
        media_factory,
    ):
        media_factory(
            entity_id=sale.id,
            entity_type="sale",
            file_name="later-sale.jpg",
            sort_order=4,
        )
        media_factory(
            entity_id=sale.id,
            entity_type="sale",
            file_name="primary-sale.jpg",
            sort_order=0,
        )

        result = media_service.get_sales_media(session, [sale.id, 999])

        assert list(result) == [sale.id]
        assert result[sale.id].media_url.endswith("primary-sale.jpg")


class create_media_test:
    @pytest.mark.asyncio
    async def creates_file_and_database_row_test(
        self,
        session,
        product,
        media_root,
        upload_file_factory,
    ):
        upload = upload_file_factory(filename="original.png")

        result = await media_service.create_media(
            session,
            upload,
            "product",
            product.id,
            alt_text="Alt text",
            sort_order=2,
        )

        row = session.get(Media, result.id)
        path = media_root / "product" / row.file_name
        assert row.entity_id == product.id
        assert row.file_name != "original.png"
        assert path.read_bytes() == b"uploaded media"
        assert result.media_url == f"/media/product/{row.file_name}"

    @pytest.mark.asyncio
    async def rejects_non_media_content_type_test(
        self,
        session,
        product,
        upload_file_factory,
    ):
        upload = upload_file_factory(
            filename="document.pdf",
            content_type="application/pdf",
        )

        with pytest.raises(ValidationException):
            await media_service.create_media(
                session,
                upload,
                "product",
                product.id,
            )

    @pytest.mark.asyncio
    async def rejects_missing_extension_test(
        self,
        session,
        product,
        upload_file_factory,
    ):
        upload = upload_file_factory(filename="image")

        with pytest.raises(ValidationException):
            await media_service.create_media(
                session,
                upload,
                "product",
                product.id,
            )


class random_file_name_test:
    def generates_random_name_with_original_extension_test(
        self,
        upload_file_factory,
    ):
        upload = upload_file_factory(filename="Original.PNG")

        result = media_service._random_file_name(upload)

        assert result.endswith(".png")
        assert result != "Original.PNG"


class create_product_media_test:
    @pytest.mark.asyncio
    async def creates_ordered_product_media_test(
        self,
        session,
        product,
        upload_file_factory,
    ):
        uploads = [
            upload_file_factory(filename="one.jpg"),
            upload_file_factory(filename="two.jpg"),
        ]

        result = await media_service.create_product_media(
            session,
            product.id,
            uploads,
        )

        assert [item.entity_id for item in result] == [product.id, product.id]
        assert [item.sort_order for item in result] == [0, 1]


class create_sale_media_test:
    @pytest.mark.asyncio
    async def creates_ordered_sale_media_test(
        self,
        session,
        sale,
        upload_file_factory,
    ):
        result = await media_service.create_sale_media(
            session,
            sale.id,
            [
                upload_file_factory(
                    filename="sale.mp4",
                    content_type="video/mp4",
                )
            ],
        )

        assert result[0].entity_id == sale.id
        assert result[0].entity_type == "sale"
        assert result[0].media_type == "video"


class get_media_file_test:
    def returns_existing_file_and_mime_type_test(self, product_media):
        path, media_type = media_service.get_media_file(
            "product",
            product_media.file_name,
        )

        assert path.is_file()
        assert media_type == "image/jpeg"

    def raises_for_missing_file_test(self, media_root):
        with pytest.raises(ContentNotFoundException):
            media_service.get_media_file("product", "missing.jpg")


class cleanup_media_test:
    def removes_orphan_rows_and_files_test(
        self,
        session,
        product,
        product_media,
        media_root,
    ):
        missing_path = media_root / "product" / product_media.file_name
        missing_path.unlink()
        orphan_path = media_root / "product" / "orphan.jpg"
        orphan_path.write_bytes(b"orphan")

        media_service.cleanup_media(session)

        assert session.get(Media, product_media.id) is None
        assert not orphan_path.exists()
