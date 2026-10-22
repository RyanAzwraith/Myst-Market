from app.utils.create_singleton import create_singleton

from app.interfaces.database import Database
from app.interfaces.media_system import MediaSystem

from app.implementations.database.sqlite.sqlite import SqliteDatabase
from app.implementations.media_system.root_folder import RootFolder

def init_database_implementation(config) -> Database:
    match config.database_implementation:
        case "sqlite":
            return SqliteDatabase(
                config.database_url,
                files_url=config.files_url,
            )
        case _:
            raise ValueError(f"Unknown database implementation: {config.database_implementation}")

init_database, get_database = create_singleton(init_database_implementation)

def init_media_system_implementation(config) -> MediaSystem:
    match config.files_implementation:
        case "root":
            return RootFolder()
        case _:
            raise ValueError(f"Unknown file implementation: {config.files_implementation}")

init_media_system, get_media_system = create_singleton(
    init_media_system_implementation
)
    