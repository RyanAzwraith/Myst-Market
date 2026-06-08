import json
from sqlalchemy.orm import Session
from app.db.database import Base
import app.db.models

MODEL_MAP = {
    mapper.class_.__tablename__: mapper.class_
    for mapper in Base.registry.mappers
}

def load_json(path: str) -> dict:
    with open(path, "r") as f:
        return json.load(f)

def get_columns(Model):
    return [c.name for c in Model.__table__.columns]

def validate_row(Model, row: dict):
    columns = get_columns(Model)

    for key in row.keys():
        if key not in columns:
            raise ValueError(
                f"Invalid column '{key}' for table {Model.__tablename__}"
            )

def seed_from_file(db: Session, path: str, mode: str = "append"):
    if mode not in {"append", "write", "empty"}:
        raise ValueError("mode must be: append | write | empty")

    data = load_json(path)

    try:
        for table_name, rows in data.items():

            if table_name not in MODEL_MAP:
                raise ValueError(f"Unknown table: {table_name}")

            Model = MODEL_MAP[table_name]

            if mode == "write":
                db.query(Model).delete()

            if mode == "empty":
                existing_count = db.query(Model).count()
                if existing_count > 0:
                    continue

            for row in rows:
                validate_row(Model, row)
                db.add(Model(**row))

        db.commit()

    except Exception:
        db.rollback()
        raise


def generate_empty_template(db: Session, path: str, include_existing: bool = False):
    output = {}

    for table_name, Model in MODEL_MAP.items():

        columns = get_columns(Model)

        # build empty shell row
        empty_row = {col: None for col in columns}

        if include_existing:
            rows = db.query(Model).all()

            output[table_name] = [
                {c: getattr(row, c) for c in columns}
                for row in rows
            ]
        else:
            output[table_name] = [empty_row]  # <-- shell template row

    with open(path, "w") as f:
        json.dump(output, f, indent=2, default=str)