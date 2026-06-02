import logging
import sys
import os

LEVEL = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO)
LOG_TO_FILE = os.getenv("LOG_TO_FILE", "false").lower()

LOG_NAMES = [
    "database",
    "api",
    "payment",
    "security",
    "services"
]


def setup_logging():

    root_logger = logging.getLogger()
    root_logger.setLevel(LEVEL)
    root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(LEVEL)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    console = logging.StreamHandler(sys.stdout)
    console.setLevel(LEVEL)
    console.setFormatter(formatter)
    root_logger.addHandler(console)

    if LOG_TO_FILE == "true":
        os.makedirs("logs", exist_ok=True)  
        file_handler = logging.FileHandler("logs/app_debug.log")
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

        for name in LOG_NAMES:
            file_handler = logging.FileHandler("logs/{}.log".format(name))
            file_handler.addFilter(lambda record, n=name: record.name.startswith(n))
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)