import pytest
from unittest.mock import MagicMock, patch

from app.core.exceptions import (
    ContentNotFoundException,
    ValidationException,
)
from app.features.media.schema import EntityType
from tests.implementations.database.sqlite.fixtures import (
    media_model_factory,
)


@pytest.mark.medium
class SqliteMediaGetAll_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                media_model_factory(
                    media_id=1,
                    file_name="later.png",
                    sort_order=2,
                ),
                media_model_factory(
                    media_id=2,
                    file_name="primary.png",
                    sort_order=1,
                ),
                media_model_factory(
                    media_id=3,
                    file_name="unsorted.png",
                    sort_order=None,
                ),
            ]
        )
        sqlite_session.commit()

        result = session_database.media.get_all(
            entity_type=EntityType.product,
            entity_id=1,
        )

        assert [media.id for media in result] == [2, 1, 3]
        assert result[0].media_url == "/media/product/primary.png"
        assert result[0].entity_type is EntityType.product

    def filters_by_entity_type_and_id_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                media_model_factory(media_id=1, entity_id=1),
                media_model_factory(
                    media_id=2,
                    entity_id=2,
                    entity_type="sale",
                ),
            ]
        )
        sqlite_session.commit()

        result = session_database.media.get_all(entity_type="sale")

        assert [media.id for media in result] == [2]

    def rejects_unknown_entity_types_test(self, session_database):
        with pytest.raises(
            ValidationException,
            match="Unsupported media entity type",
        ):
            session_database.media.get_all(entity_type="user")


@pytest.mark.medium
class SqliteMediaGetPrimary_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                media_model_factory(
                    media_id=1,
                    file_name="secondary.png",
                    sort_order=2,
                ),
                media_model_factory(
                    media_id=2,
                    file_name="primary.png",
                    sort_order=1,
                ),
            ]
        )
        sqlite_session.commit()

        result = session_database.media.get_primary("product", 1)

        assert result.id == 2
        assert result.media_url == "/media/product/primary.png"

    def raises_for_missing_media_test(self, session_database):
        with pytest.raises(
            ContentNotFoundException,
            match="Media Not Found",
        ) as error:
            session_database.media.get_primary("product", 99)

        assert error.value.details == {
            "entity_type": "product",
            "entity_id": 99,
        }


@pytest.mark.medium
class SqliteMediaGetPrimaryForMany_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                media_model_factory(
                    media_id=1,
                    entity_id=1,
                    file_name="one.png",
                ),
                media_model_factory(
                    media_id=2,
                    entity_id=2,
                    file_name="two.png",
                ),
                media_model_factory(
                    media_id=3,
                    entity_id=1,
                    file_name="one-primary.png",
                    sort_order=0,
                ),
            ]
        )
        sqlite_session.commit()

        result = session_database.media.get_primary_for_many(
            "product",
            [1, 2],
        )

        assert [media.id for media in result] == [3, 2]

    def returns_empty_for_empty_ids_test(self, session_database):
        assert session_database.media.get_primary_for_many(
            "product",
            [],
        ) == []


@pytest.mark.medium
class SqliteMediaCleanup_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                media_model_factory(
                    media_id=1,
                    file_name="present.png",
                ),
                media_model_factory(
                    media_id=2,
                    file_name="missing.png",
                ),
            ]
        )
        sqlite_session.commit()
        media_system = MagicMock()
        media_system.exists.side_effect = (
            lambda path: path.endswith("present.png")
        )

        with patch(
            "app.core.implementations.get_media_system",
            return_value=media_system,
        ):
            session_database.media.cleanup()

        assert sqlite_session.get(
            type(media_model_factory()),
            1,
        ) is not None
        assert sqlite_session.get(
            type(media_model_factory()),
            2,
        ) is None
        media_system.exists.assert_any_call("product/missing.png")

    def treats_invalid_paths_as_missing_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add(
            media_model_factory(
                file_name="../invalid.png",
            )
        )
        sqlite_session.commit()
        media_system = MagicMock()
        media_system.exists.side_effect = ValueError("invalid path")

        with patch(
            "app.core.implementations.get_media_system",
            return_value=media_system,
        ):
            session_database.media.cleanup()

        assert sqlite_session.get(
            type(media_model_factory()),
            1,
        ) is None
