
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from app.core import get_media_system
from app.api.paths import Paths
from .schema import EntityType


media_router = APIRouter()

@media_router.get(
    Paths.Media.get("{entity_type}", "{file_name}"),
    response_class=FileResponse,
)
async def get_media_file_route(
    entity_type: EntityType,
    file_name: str,
):
    media_system = get_media_system()
    path, media_type = media_system.get(
        f"{entity_type.value}/{file_name}"
    )
    return FileResponse(path, media_type=media_type)
