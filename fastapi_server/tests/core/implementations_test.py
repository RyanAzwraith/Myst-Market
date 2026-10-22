from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.core import implementations
from tests.core.fixtures import config_factory


@pytest.mark.medium
class InitDatabaseImplementation_test:
    def functionality_test(self, monkeypatch):
        database = object()
        database_constructor = Mock(return_value=database)
        monkeypatch.setattr(
            implementations,
            "SqliteDatabase",
            database_constructor,
        )
        config = config_factory(
            database_implementation="sqlite",
            database_url="sqlite://test",
        )

        result = implementations.init_database_implementation(config)

        assert result is database
        database_constructor.assert_called_once_with("sqlite://test")

    def rejects_unknown_database_implementation_test(self):
        config = config_factory(database_implementation="unknown")

        with pytest.raises(
            ValueError,
            match="Unknown database implementation: unknown",
        ):
            implementations.init_database_implementation(config)


@pytest.mark.medium
class InitMediaSystemImplementation_test:
    def functionality_test(self, monkeypatch):
        media_system = object()
        media_constructor = Mock(return_value=media_system)
        monkeypatch.setattr(
            implementations,
            "RootFolder",
            media_constructor,
        )
        config = config_factory(files_implementation="root")

        result = implementations.init_media_system_implementation(config)

        assert result is media_system
        media_constructor.assert_called_once_with()

    def rejects_unknown_media_implementation_test(self):
        config = SimpleNamespace(files_implementation="unknown")

        with pytest.raises(
            ValueError,
            match="Unknown file implementation: unknown",
        ):
            implementations.init_media_system_implementation(config)
