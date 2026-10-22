import logging
from unittest.mock import Mock

import pytest

from app.core import logger as logger_module


@pytest.mark.low
class MakeFilter_test:
    def functionality_test(self):
        record = logging.LogRecord(
            "app.api.routes",
            logging.INFO,
            "",
            0,
            "",
            (),
            None,
        )
        log_filter = logger_module.make_filter("api")

        assert log_filter(record) is True

    def rejects_unrelated_logger_test(self):
        record = logging.LogRecord(
            "app.database",
            logging.INFO,
            "",
            0,
            "",
            (),
            None,
        )
        log_filter = logger_module.make_filter("api")

        assert log_filter(record) is False


@pytest.mark.medium
class CreateLogger_test:
    def functionality_test(self, monkeypatch):
        root_logger = Mock()
        root_logger.handlers = []
        named_loggers = {}

        def get_logger(name=None):
            if name is None:
                return root_logger
            named_loggers[name] = Mock()
            return named_loggers[name]

        console_handler = Mock()
        monkeypatch.setattr(
            logger_module.logging,
            "getLogger",
            get_logger,
        )
        monkeypatch.setattr(
            logger_module.logging,
            "StreamHandler",
            lambda stream: console_handler,
        )

        result = logger_module.create_logger("info", False)

        root_logger.setLevel.assert_called_once_with(logging.DEBUG)
        root_logger.addHandler.assert_called_once_with(console_handler)
        console_handler.setLevel.assert_called_once_with(logging.INFO)
        assert result.api is named_loggers["app.api"]
        assert result.requests is named_loggers["app.requests"]

    def creates_file_handlers_when_enabled_test(self, monkeypatch):
        root_logger = Mock()
        root_logger.handlers = []
        file_handlers = []

        def get_logger(name=None):
            return root_logger if name is None else Mock()

        def file_handler(path, mode):
            handler = Mock()
            file_handlers.append((path, mode, handler))
            return handler

        monkeypatch.setattr(
            logger_module.logging,
            "getLogger",
            get_logger,
        )
        monkeypatch.setattr(
            logger_module.logging,
            "StreamHandler",
            lambda stream: Mock(),
        )
        monkeypatch.setattr(
            logger_module.logging,
            "FileHandler",
            file_handler,
        )
        make_directory = Mock()
        monkeypatch.setattr(logger_module.os, "makedirs", make_directory)

        logger_module.create_logger("WARNING", True)

        make_directory.assert_called_once_with("logs", exist_ok=True)
        assert len(file_handlers) == len(logger_module.LOG_NAMES) + 1
        assert file_handlers[0][0] == "logs/app_debug.log"
        assert all(mode == "w" for _, mode, _ in file_handlers)
        for _, _, handler in file_handlers:
            handler.setLevel.assert_called_once_with(logging.DEBUG)
