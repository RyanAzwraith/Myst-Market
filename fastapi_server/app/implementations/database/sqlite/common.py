from __future__ import annotations

from typing import Any, TypeVar

from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.core.exceptions import ContentNotFoundException


ModelT = TypeVar("ModelT")

SUCCESSFUL_ORDER_STATUSES = ("processing", "shipped", "delivered")
LOST_ORDER_STATUSES = ("error", "cancelled")


def get_model(
    session: Session,
    model: type[ModelT],
    model_name: str,
    model_id: int,
) -> ModelT:
    result = session.get(model, model_id)
    if result is None:
        raise ContentNotFoundException(
            f"{model_name} Not Found",
            details={f"{model_name.lower()}_id": model_id},
        )
    return result


def execute_page(
    session: Session,
    statement: Select[Any],
    limit: int | None,
    offset: int,
) -> tuple[list[Any], bool]:
    validate_pagination(limit, offset)

    statement = statement.offset(offset)
    if limit is not None:
        statement = statement.limit(limit + 1)

    rows = list(session.execute(statement).mappings())
    has_more = limit is not None and len(rows) > limit

    if has_more:
        rows = rows[:limit]

    return rows, has_more


def validate_pagination(limit: int | None, offset: int) -> None:
    if limit is not None and limit < 0:
        raise ValueError("limit must be non-negative")
    if offset < 0:
        raise ValueError("offset must be non-negative")