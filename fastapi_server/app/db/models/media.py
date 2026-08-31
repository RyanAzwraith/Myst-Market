from __future__ import annotations
from sqlalchemy import Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


    order: Mapped["Order"] = relationship("Order", back_populates="order_products")
class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(Text, nullable=False)

    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    entity_type: Mapped[str] = mapped_column(Text, nullable=False)

    alt_text: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int | None] = mapped_column(Integer)
