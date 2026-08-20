import mimetypes
from pathlib import Path
from secrets import token_hex

from fastapi import UploadFile
from sqlalchemy import func, inspect
from sqlalchemy.orm import Session

from app.core import get_config
from app.core.exceptions import ContentNotFoundException, ValidationException
from app.db.models import Media

from .media_schema import EntityType, MediaDetail


_ENTITY_DIRECTORIES = {
    "product": "product",
    "sale": "sale",
}
_MEDIA_TYPES = {"image", "video"}


def _media_root() -> Path:
    root = Path(get_config().media_url).expanduser()
    root.mkdir(parents=True, exist_ok=True)
    for directory in _ENTITY_DIRECTORIES.values():
        (root / directory).mkdir(exist_ok=True)
    return root


def _entity_directory(entity_type: EntityType) -> str:
    try:
        return _ENTITY_DIRECTORIES[entity_type]
    except KeyError as exc:
        raise ValidationException(
            f"Unsupported media entity type: {entity_type}"
        ) from exc


def _media_path(entity_type: EntityType, file_name: str) -> Path:
    if Path(file_name).name != file_name:
        raise ValidationException("Media filename must not contain a path")
    return _media_root() / _entity_directory(entity_type) / file_name


def _media_url(media: Media) -> str:
    return f"/media/{media.entity_type}/{media.file_name}"


def _media_detail(media: Media) -> MediaDetail:
    return MediaDetail.from_Media(media, _media_url(media))


def get_product_media(session: Session, product_id: int) -> list[MediaDetail]:
    media = (
        session.query(Media)
        .filter(
            Media.entity_type == "product",
            Media.entity_id == product_id,
        )
        .order_by(Media.sort_order.asc().nulls_last(), Media.id)
        .all()
    )
    return [_media_detail(item) for item in media]


def _get_primary_media(
    session: Session,
    entity_type: EntityType,
    entity_ids: list[int],
) -> list[Media]:
    if not entity_ids:
        return []

    ranked_media = (
        session.query(
            Media.id.label("media_id"),
            Media.entity_id.label("entity_id"),
            func.row_number()
            .over(
                partition_by=Media.entity_id,
                order_by=(
                    Media.sort_order.asc().nulls_last(),
                    Media.id,
                ),
            )
            .label("row_num"),
        )
        .filter(
            Media.entity_type == entity_type,
            Media.entity_id.in_(entity_ids),
        )
        .subquery()
    )

    return (
        session.query(Media)
        .join(ranked_media, Media.id == ranked_media.c.media_id)
        .filter(ranked_media.c.row_num == 1)
        .all()
    )


def get_products_media(
    session: Session,
    product_ids: list[int],
) -> dict[int, MediaDetail]:
    return {
        media.entity_id: _media_detail(media)
        for media in _get_primary_media(session, "product", product_ids)
    }


def get_sale_media(session: Session, sale_id: int) -> list[MediaDetail]:
    media = (
        session.query(Media)
        .filter(
            Media.entity_type == "sale",
            Media.entity_id == sale_id,
        )
        .order_by(Media.sort_order.asc().nulls_last(), Media.id)
        .all()
    )
    return [_media_detail(item) for item in media]


def get_sales_media(
    session: Session,
    sale_ids: list[int],
) -> dict[int, MediaDetail]:
    return {
        media.entity_id: _media_detail(media)
        for media in _get_primary_media(session, "sale", sale_ids)
    }


def _random_file_name(upload: UploadFile) -> str:
    suffix = Path(upload.filename or "").suffix.lower()
    if not suffix or len(suffix) > 10 or not suffix[1:].isalnum():
        raise ValidationException("Media files must have a valid extension")
    return f"{token_hex(16)}{suffix}"


async def create_media(
    session: Session,
    upload: UploadFile,
    entity_type: EntityType,
    entity_id: int,
    alt_text: str | None = None,
    sort_order: int | None = None,
) -> MediaDetail:
    media_type = (upload.content_type or "").split("/", 1)[0]
    if media_type not in _MEDIA_TYPES:
        raise ValidationException("Only image and video files are supported")

    file_name = _random_file_name(upload)
    path = _media_path(entity_type, file_name)
    path.write_bytes(await upload.read())

    media = Media(
        type=media_type,
        file_name=file_name,
        entity_id=entity_id,
        entity_type=entity_type,
        alt_text=alt_text,
        sort_order=sort_order,
    )
    session.add(media)
    session.commit()
    session.refresh(media)
    return _media_detail(media)


async def create_product_media(
    session: Session,
    product_id: int,
    uploads: list[UploadFile],
) -> list[MediaDetail]:
    return [
        await create_media(session, upload, "product", product_id, sort_order=index)
        for index, upload in enumerate(uploads)
    ]


async def create_sale_media(
    session: Session,
    sale_id: int,
    uploads: list[UploadFile],
) -> list[MediaDetail]:
    return [
        await create_media(session, upload, "sale", sale_id, sort_order=index)
        for index, upload in enumerate(uploads)
    ]


def get_media_file(entity_type: EntityType, file_name: str) -> tuple[Path, str]:
    path = _media_path(entity_type, file_name)
    if not path.is_file():
        raise ContentNotFoundException("Media file not found")
    return path, mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def cleanup_media(session: Session) -> None:
    root = _media_root()
    database_files: set[tuple[str, str]] = set()
    removed_rows = 0
    removed_files = 0

    if not inspect(session.bind).has_table(Media.__tablename__):
        print("Media table not found; skipping media cleanup")
        return

    media_rows = session.query(Media).all()
    for media in media_rows:
        database_files.add((media.entity_type, media.file_name))
        path = _media_path(media.entity_type, media.file_name)
        if not path.is_file():
            print(f"Removing media row with missing file: {path}")
            session.delete(media)
            removed_rows += 1

    for entity_type, directory in _ENTITY_DIRECTORIES.items():
        for path in (root / directory).iterdir():
            if path.is_file() and (entity_type, path.name) not in database_files:
                print(f"Removing media file with missing row: {path}")
                path.unlink()
                removed_files += 1

    if removed_rows:
        session.commit()
    print(
        f"Media cleanup complete: removed {removed_rows} rows and {removed_files} files"
    )
