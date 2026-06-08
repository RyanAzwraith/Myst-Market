from __future__ import annotations
from sqlalchemy import Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .media import Media

class MediaEntity(Base):
    __tablename__ = "media_entity"

    entity_type: Mapped[str] = mapped_column(
        Text,
        primary_key=True,
    )

    entity_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    media_id: Mapped[int] = mapped_column(
        ForeignKey("media.id", ondelete="CASCADE"),
        primary_key=True,
    )

    media: Mapped["Media"] = relationship(
        "Media",
        back_populates="media_entities",
    )