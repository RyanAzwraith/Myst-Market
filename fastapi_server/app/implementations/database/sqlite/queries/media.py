from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ContentNotFoundException, ValidationException
from app.features.media.schema import MediaDetail
from app.interfaces.database_schemas.Media import Media as MediaInterface

from ..models.media import Media as MediaModel


class SqliteMedia(MediaInterface):
    def __init__(
        self,
        session: Session,
        files_url: str | None = None,
    ):
        self._session = session
        self._files_url = files_url

    def get_all(
        self,
        entity_type: str | None = None,
        entity_id: int | None = None,
    ) -> list[MediaDetail]:
        if entity_type is not None:
            entity_type = self._validate_entity_type(entity_type)

        statement = select(MediaModel)
        if entity_type is not None:
            statement = statement.where(
                MediaModel.entity_type == entity_type,
            )
        if entity_id is not None:
            statement = statement.where(
                MediaModel.entity_id == entity_id,
            )
        statement = statement.order_by(
            MediaModel.sort_order.asc().nulls_last(),
            MediaModel.id,
        )
        media = self._session.scalars(statement).all()
        return [self._to_schema(item) for item in media]

    def get_primary(
        self,
        entity_type: str,
        entity_id: int,
    ) -> MediaDetail:
        entity_type = self._validate_entity_type(entity_type)
        statement = (
            select(MediaModel)
            .where(
                MediaModel.entity_type == entity_type,
                MediaModel.entity_id == entity_id,
            )
            .order_by(
                MediaModel.sort_order.asc().nulls_last(),
                MediaModel.id,
            )
            .limit(1)
        )
        media = self._session.scalar(statement)
        if media is None:
            raise ContentNotFoundException(
                "Media Not Found",
                details={
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                },
            )
        return self._to_schema(media)

    def get_primary_for_many(
        self,
        entity_type: str,
        entity_ids: list[int],
    ) -> list[MediaDetail]:
        entity_type = self._validate_entity_type(entity_type)
        if not entity_ids:
            return []

        ranked_media = (
            select(
                MediaModel.id.label("media_id"),
                func.row_number().over(
                    partition_by=MediaModel.entity_id,
                    order_by=(
                        MediaModel.sort_order.asc().nulls_last(),
                        MediaModel.id,
                    ),
                ).label("row_number"),
            )
            .where(
                MediaModel.entity_type == entity_type,
                MediaModel.entity_id.in_(set(entity_ids)),
            )
            .subquery()
        )
        statement = (
            select(MediaModel)
            .join(
                ranked_media,
                MediaModel.id == ranked_media.c.media_id,
            )
            .where(ranked_media.c.row_number == 1)
            .order_by(MediaModel.entity_id, MediaModel.id)
        )
        media = self._session.scalars(statement).all()
        return [self._to_schema(item) for item in media]

    def cleanup(self) -> None:
        from app.core.implementations import get_media_system

        media_system = get_media_system()
        media = self._session.scalars(select(MediaModel)).all()
        removed = False
        for item in media:
            path = f"{item.entity_type}/{item.file_name}"
            try:
                file_exists = media_system.exists(path)
            except ValueError:
                file_exists = False
            if file_exists:
                continue
            self._session.delete(item)
            removed = True
            print(
                "Removed media metadata without a file: "
                f"{path}"
            )
        if removed:
            self._session.commit()

    @staticmethod
    def _validate_entity_type(entity_type: Any) -> str:
        entity_type = getattr(entity_type, "value", entity_type)
        if entity_type not in {"product", "sale"}:
            raise ValidationException(
                f"Unsupported media entity type: {entity_type}"
            )
        return entity_type

    def _to_schema(self, media: MediaModel) -> MediaDetail:
        media_path = f"{media.entity_type}/{media.file_name}"
        media_url = (
            f"{self._files_url.rstrip('/')}/{media_path}"
            if self._files_url
            else f"/media/{media_path}"
        )
        return MediaDetail(
            id=media.id,
            media_type=media.type,
            media_url=media_url,
            entity_id=media.entity_id,
            entity_type=media.entity_type,
            alt_text=media.alt_text,
            sort_order=media.sort_order,
        )
