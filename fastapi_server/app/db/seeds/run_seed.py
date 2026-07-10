import argparse

from sqlalchemy import delete

from app.core.config import init_config
from app.db.database import Base, Database

from .base_seed import base_seed
from .dev_seed import dev_seed
from .stress_seed import stress_seed


def clear_tables(db):
    Base.metadata.drop_all(db.engine)
    Base.metadata.create_all(db.engine)

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
    if config.environment != "development":
        raise RuntimeError( f"Database seeding only allowed when ENVIRONMENT=development, not {config.environment}")
    db = Database(config.database_url)
    session = next(db.get_session())
    if args.clear:
        clear_tables(db)

    base_seed(session)
    dev_seed(session)

    # stress_seed(db)

#python -m app.db.seeds.run_seed
#python -m app.db.seeds.run_seed --clear
