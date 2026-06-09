import argparse

from sqlalchemy import delete

from app.core.config import init_config
from app.db.database import Base, Database

from .base_seed import seed as base_seed
from .dev_seed import seed as dev_seed
from .stress_seed import seed as stress_seed


def clear_tables(db):
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(delete(table))
    db.commit()


def parse_args():
    parser = argparse.ArgumentParser(description="Run database seeds.")
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear all tables before seeding.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    config = init_config()
    db = next(Database(config).get_session())

    if args.clear:
        clear_tables(db)

    base_seed(db)
    dev_seed(db)

    # stress_seed(db)

#python -m app.db.seeds.run_seed
#python -m app.db.seeds.run_seed --clear
