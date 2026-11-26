from pathlib import Path
from unittest.mock import MagicMock

import pytest

from app.core.exceptions import ContentNotFoundException
from app.implementations.media_system import root_folder as root_module
from app.features.media.schema import EntityType
from tests.implementations.media_system.fixtures import (
    media_record_factory,
    root_folder_factory,
)


@pytest.mark.medium
class RootFolderInit_test:
    def functionality_test(self, tmp_path):
        root = root_folder_factory(tmp_path / "media")

        assert root.root == (tmp_path / "media").resolve()
        assert root.root.is_dir()

    def expands_string_paths_test(self, tmp_path):
        root = root_folder_factory(str(tmp_path))

        assert root.root == tmp_path.resolve()


@pytest.mark.medium
class RootFolderCreate_test:
    @pytest.mark.asyncio
    async def functionality_test(self, root_folder):
        relative_path = await root_folder.create(
            b"image-data",
            "Battle-Axe.PNG",
            directory="product",
        )

        assert relative_path.startswith("product/")
        assert relative_path.endswith(".png")
        assert (
            root_folder.root / Path(relative_path)
        ).read_bytes() == b"image-data"

    @pytest.mark.asyncio
    async def creates_in_root_when_directory_is_empty_test(
        self,
        root_folder,
    ):
        relative_path = await root_folder.create(
            b"file-data",
            "readme.txt",
            directory="",
        )

        assert "/" not in relative_path
        assert (root_folder.root / relative_path).read_bytes() == (
            b"file-data"
        )

    @pytest.mark.asyncio
    async def retries_when_generated_name_collides_test(
        self,
        root_folder,
        monkeypatch,
    ):
        product_dir = root_folder.root / "product"
        product_dir.mkdir()
        (product_dir / "same.png").write_bytes(b"existing")
        token = iter(["same", "next"])
        monkeypatch.setattr(
            root_module,
            "token_hex",
            lambda length: next(token),
        )

        relative_path = await root_folder.create(
            b"new",
            "image.png",
            directory="product",
        )

        assert relative_path == "product/next.png"
        assert (product_dir / "same.png").read_bytes() == b"existing"
        assert (product_dir / "next.png").read_bytes() == b"new"

    @pytest.mark.parametrize(
        "original_name",
        [
            "",
            "../image.png",
            "nested/image.png",
            "no-extension",
            ".hidden",
            "invalid.",
        ],
    )
    @pytest.mark.asyncio
    async def rejects_invalid_original_names_test(
        self,
        root_folder,
        original_name,
    ):
        with pytest.raises(ValueError):
            await root_folder.create(b"data", original_name)


@pytest.mark.medium
class RootFolderGet_test:
    def functionality_test(self, root_folder):
        path = root_folder.root / "product" / "battle-axe.png"
        path.parent.mkdir()
        path.write_bytes(b"image-data")

        resolved_path, media_type = root_folder.get(
            "product/battle-axe.png",
        )

        assert resolved_path == path
        assert media_type == "image/png"

    def uses_binary_fallback_for_unknown_extensions_test(
        self,
        root_folder,
    ):
        path = root_folder.root / "product" / "file.zzzznotmime"
        path.parent.mkdir()
        path.write_bytes(b"data")

        _, media_type = root_folder.get(
            "product/file.zzzznotmime",
        )

        assert media_type == "application/octet-stream"

    def raises_for_missing_files_test(self, root_folder):
        with pytest.raises(
            ContentNotFoundException,
            match="Media file not found",
        ) as error:
            root_folder.get("product/missing.png")

        assert error.value.details == {"path": "product/missing.png"}


@pytest.mark.medium
class RootFolderExists_test:
    def functionality_test(self, root_folder):
        path = root_folder.root / "sale" / "summer.png"
        path.parent.mkdir()
        path.write_bytes(b"data")

        assert root_folder.exists("sale/summer.png") is True
        assert root_folder.exists("sale/missing.png") is False

    def rejects_paths_outside_root_test(self, root_folder):
        with pytest.raises(ValueError, match="within the root folder"):
            root_folder.exists("../outside.png")


@pytest.mark.medium
class RootFolderList_test:
    def functionality_test(self, root_folder):
        product_dir = root_folder.root / "product"
        product_dir.mkdir()
        (product_dir / "z.png").write_bytes(b"z")
        (product_dir / "a.png").write_bytes(b"a")
        (product_dir / "nested").mkdir()
        (product_dir / "nested" / "ignored.png").write_bytes(b"nested")

        result = root_folder.list("product")

        assert result == ["product/a.png", "product/z.png"]

    def returns_empty_for_missing_directories_test(self, root_folder):
        assert root_folder.list("missing") == []


@pytest.mark.medium
class RootFolderDelete_test:
    def functionality_test(self, root_folder):
        path = root_folder.root / "product" / "delete.png"
        path.parent.mkdir()
        path.write_bytes(b"data")

        root_folder.delete("product/delete.png")

        assert path.exists() is False

    def raises_for_missing_files_test(self, root_folder):
        with pytest.raises(
            ContentNotFoundException,
            match="Media file not found",
        ):
            root_folder.delete("product/missing.png")


@pytest.mark.high
class RootFolderCleanup_test:
    def functionality_test(self, root_folder, monkeypatch):
        product_dir = root_folder.root / "product"
        sale_dir = root_folder.root / "sale"
        unrelated_dir = root_folder.root / "other"
        for directory in (product_dir, sale_dir, unrelated_dir):
            directory.mkdir()

        kept_product = product_dir / "kept.png"
        orphaned_product = product_dir / "orphaned.png"
        kept_sale = sale_dir / "kept.mp4"
        orphaned_sale = sale_dir / "orphaned.mp4"
        unrelated = unrelated_dir / "orphaned.png"
        for path in (
            kept_product,
            orphaned_product,
            kept_sale,
            orphaned_sale,
            unrelated,
        ):
            path.write_bytes(b"data")

        database = MagicMock()
        session = object()
        session_generator = MagicMock()
        session_generator.__next__.return_value = session
        database.session_factory.return_value = session_generator
        database.with_session.return_value = database
        database.media.get_all.return_value = [
            media_record_factory(),
            media_record_factory(
                entity_type=EntityType.sale,
                media_url="/media/sale/kept.mp4",
            ),
        ]
        monkeypatch.setattr(
            "app.core.implementations.get_database",
            lambda: database,
        )

        root_folder.cleanup()

        assert kept_product.exists() is True
        assert kept_sale.exists() is True
        assert orphaned_product.exists() is False
        assert orphaned_sale.exists() is False
        assert unrelated.exists() is True
        session_generator.close.assert_called_once_with()

    def closes_database_session_when_metadata_lookup_fails_test(
        self,
        root_folder,
        monkeypatch,
    ):
        database = MagicMock()
        session_generator = MagicMock()
        session_generator.__next__.return_value = object()
        database.session_factory.return_value = session_generator
        database.with_session.side_effect = RuntimeError("database failed")
        monkeypatch.setattr(
            "app.core.implementations.get_database",
            lambda: database,
        )

        with pytest.raises(RuntimeError, match="database failed"):
            root_folder.cleanup()

        session_generator.close.assert_called_once_with()
