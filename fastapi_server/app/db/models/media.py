from __future__ import annotations
from datetime import datetime
from sqlalchemy import Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .media_entity import MediaEntity


class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(nullable=False)

    alt_text: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int | None] = mapped_column(Integer)

    media_entities: Mapped[list["MediaEntity"]] = relationship(
        "MediaEntity",
        back_populates="media",
    )