import logging
import sys
import os
from types import SimpleNamespace

LOG_NAMES = [
    "init",
    "database",
    "api",
    "payment",
    "security",
    "services",
    "app"
]

CONSOLE_LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
FILE_LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(filename)s | %(funcName)s:%(lineno)d \n \t - %(message)s"

def make_filter(prefix: str):
    def _filter(record):
        return record.name.startswith(prefix)
    return _filter

logger = None

def init_logger(config):
        LOG_LEVEL = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
        LOG_TO_FILE = config.LOG_TO_FILE.lower() == "true"

        root_logger = logging.getLogger()
        root_logger.setLevel(LOG_LEVEL)
        root_logger.handlers.clear()

        console = logging.StreamHandler(sys.stdout)
        console.setLevel(LOG_LEVEL)
        console.setFormatter(logging.Formatter(CONSOLE_LOG_FORMAT))
        root_logger.addHandler(console)

        if LOG_TO_FILE:
            os.makedirs("logs", exist_ok=True)  
            file_handler = logging.FileHandler("logs/app_debug.log")
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(logging.Formatter(FILE_LOG_FORMAT))
            root_logger.addHandler(file_handler)

            for name in LOG_NAMES:
                file_handler = logging.FileHandler("logs/{}.log".format(name))
                file_handler.addFilter(make_filter(name))
                file_handler.setLevel(logging.DEBUG)
                file_handler.setFormatter(FILE_LOG_FORMAT)
                root_logger.addHandler(file_handler)

        return SimpleNamespace(**{n: logging.getLogger(n) for n in LOG_NAMES})
