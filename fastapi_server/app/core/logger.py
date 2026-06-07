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

CONSOLE_LOG_FORMATTER = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
FILE_LOG_FORMATTER = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(filename)s | %(funcName)s:%(lineno)d \n \t - %(message)s")

def make_filter(prefix: str):
    def _filter(record):
        return record.name == f"app.{prefix}" or record.name.startswith(f"app.{prefix}.")
    return _filter

logger = None

def init_logger(config):
        log_level = getattr(logging, config.log_level.upper(), logging.INFO)
        log_to_file = config.log_to_file

        root_logger = logging.getLogger()
        root_logger.setLevel(logging.DEBUG)
        root_logger.handlers.clear()

        console = logging.StreamHandler(sys.stdout)
        console.setLevel(log_level)
        console.setFormatter(CONSOLE_LOG_FORMATTER)
        root_logger.addHandler(console)

        if log_to_file:
            os.makedirs("logs", exist_ok=True)  
            dubug_handler = logging.FileHandler("logs/app_debug.log", mode="w")
            dubug_handler.setLevel(logging.DEBUG)
            dubug_handler.setFormatter(FILE_LOG_FORMATTER)
            root_logger.addHandler(dubug_handler)

            for name in LOG_NAMES:
                handler = logging.FileHandler(f"logs/{name}.log", mode="w")
                handler.setLevel(logging.DEBUG)
                handler.setFormatter(FILE_LOG_FORMATTER)
                handler.addFilter(make_filter(name))
                root_logger.addHandler(handler)
        
        return SimpleNamespace(**{n: logging.getLogger(f"app.{n}") for n in LOG_NAMES})
