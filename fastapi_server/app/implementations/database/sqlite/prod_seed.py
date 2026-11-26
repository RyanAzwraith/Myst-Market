from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any

from sqlalchemy import select

from app.core.config import init_config
from app.features.auth.service import hash_password
from app.implementations.database.sqlite.Base import Base
from app.implementations.database.sqlite.models import (
    Address,
    Item,
    Media,
    Order,
    Payment,
    Product,
    Review,
    Sale,
    Stock,
    User,
)
from app.implementations.database.sqlite.models.association_tables import (
    sale_product,
)
from app.implementations.database.sqlite.sqlite import SqliteDatabase


DATA_DIRECTORY = Path(__file__).resolve().with_name("data")
MEDIA_DIRECTORY = Path(__file__).resolve().parents[5] / "media"
MEDIA_FILENAME_PATTERN = re.compile(r"^(?P<slug>.+)-(?P<sort_order>\d+)$")
DATA_FILES = (
    "users.json",
    "addresses.json",
    "products.json",
    "stock.json",
    "sales.json",
    "sale_product.json",
    "orders.json",
    "items.json",
    "payments.json",
    "reviews.json",
)


def _load_rows(filename: str) -> list[dict[str, Any]]:
    path = DATA_DIRECTORY / filename
    if not path.is_file():
        raise FileNotFoundError(f"Seed data file is missing: {path}")

    with path.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    if not isinstance(payload, list) or not all(
        isinstance(row, dict) for row in payload
    ):
        raise ValueError(f"Seed data must be a JSON array of objects: {path}")

    return [dict(row) for row in payload]


def _load_data() -> dict[str, list[dict[str, Any]]]:
    return {
        filename.removesuffix(".json"): _load_rows(filename)
        for filename in DATA_FILES
    }


def _as_date(value: str | None) -> date | None:
    if value is None:
        return None
    return date.fromisoformat(value)


def _with_dates(
    row: dict[str, Any],
    *fields: str,
) -> dict[str, Any]:
    prepared = dict(row)
    for field in fields:
        prepared[field] = _as_date(prepared.get(field))
    return prepared


def _user_model(row: dict[str, Any]) -> User:
    prepared = _with_dates(row, "created_at", "deleted_at")
    password = prepared.get("password_hash")
    if password:
        prepared["password_hash"] = hash_password(password)
    return User(**prepared)


def _assert_database_is_empty(session) -> None:
    if session.scalar(select(User.id).limit(1)) is not None:
        raise RuntimeError(
            "Refusing to seed a non-empty database. "
            "Use a fresh production database."
        )


def _media_models(
    products: list[Product],
    sales: list[Sale],
) -> list[Media]:
    entities = {
        "product": {product.slug: product for product in products},
        "sale": {sale.slug: sale for sale in sales},
    }
    media = []

    for entity_type, entity_by_slug in entities.items():
        directory = MEDIA_DIRECTORY / entity_type
        if not directory.is_dir():
            raise FileNotFoundError(
                f"Seed media directory is missing: {directory}"
            )

        seen_orders: set[tuple[str, int]] = set()
        for path in sorted(directory.iterdir()):
            if not path.is_file():
                continue

            match = MEDIA_FILENAME_PATTERN.fullmatch(path.stem)
            if match is None:
                raise ValueError(
                    "Seed media filename must end with a numeric order: "
                    f"{path.name}"
                )

            slug = match.group("slug")
            sort_order = int(match.group("sort_order"))
            entity = entity_by_slug.get(slug)
            if entity is None:
                raise ValueError(
                    f"Seed media file does not match a {entity_type} slug: "
                    f"{path.name}"
                )

            key = (slug, sort_order)
            if key in seen_orders:
                raise ValueError(
                    f"Duplicate {entity_type} media order {sort_order} "
                    f"for slug {slug}"
                )
            seen_orders.add(key)

            media.append(
                Media(
                    type="image",
                    file_name=path.name,
                    entity_id=entity.id,
                    entity_type=entity_type,
                    alt_text=entity.name,
                    sort_order=sort_order,
                )
            )

    return media


def seed_database(database_url: str) -> None:
    data = _load_data()
    database = SqliteDatabase(database_url)

    try:
        Base.metadata.create_all(database.engine)

        with database.make_session() as session:
            with session.begin():
                _assert_database_is_empty(session)

                users = [_user_model(row) for row in data["users"]]
                session.add_all(users)
                session.flush()

                addresses = [
                    Address(**row) for row in data["addresses"]
                ]
                session.add_all(addresses)

                products = [
                    Product(
                        **_with_dates(
                            row,
                            "created_at",
                            "discontinued_at",
                        )
                    )
                    for row in data["products"]
                ]
                session.add_all(products)
                session.flush()

                stock = [
                    Stock(**_with_dates(row, "updated_at"))
                    for row in data["stock"]
                ]
                session.add_all(stock)

                sales = [
                    Sale(
                        **_with_dates(row, "start_at", "end_at")
                    )
                    for row in data["sales"]
                ]
                session.add_all(sales)
                session.flush()

                media = _media_models(products, sales)
                session.add_all(media)

                session.execute(
                    sale_product.insert(),
                    data["sale_product"],
                )

                orders = [
                    Order(
                        **_with_dates(
                            row,
                            "created_at",
                            "updated_at",
                            "sent_at",
                        )
                    )
                    for row in data["orders"]
                ]
                session.add_all(orders)
                session.flush()

                items = [Item(**row) for row in data["items"]]
                session.add_all(items)

                payments = [
                    Payment(
                        **_with_dates(row, "created_at", "updated_at")
                    )
                    for row in data["payments"]
                ]
                session.add_all(payments)

                reviews = [
                    Review(**_with_dates(row, "created_at"))
                    for row in data["reviews"]
                ]
                session.add_all(reviews)

        print(f"Seeded {database_url} from {DATA_DIRECTORY}")
        for name, rows in data.items():
            print(f"{name}: {len(rows)}")
        print(f"media: {len(media)}")
    finally:
        database.engine.dispose()


def main() -> None:
    config = init_config()
    if config.database_implementation != "sqlite":
        raise RuntimeError(
            "The production seed script only supports SQLite databases"
        )
    if config.environment not in {"prod", "production", "dev"}:
        raise RuntimeError(
            "Production database seeding requires ENVIRONMENT=prod or dev"
        )
    seed_database(config.database_url)


if __name__ == "__main__":
    main()


# python -m app.implementations.database.sqlite.prod_seed
