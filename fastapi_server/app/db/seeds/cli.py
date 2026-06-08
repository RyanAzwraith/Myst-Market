import argparse
from app.db.database import Database
from app.db.seeds.loader import seed_from_file, generate_empty_template
from app.core.config import init_config


def main():
    parser = argparse.ArgumentParser(description="DB Seeder Tool")

    parser.add_argument("--file", help="Seed JSON file path")
    parser.add_argument("--mode", default="append", choices=["append", "write", "empty"])

    parser.add_argument("--generate", help="Generate empty seed template file")
    parser.add_argument("--include-existing", action="store_true")

    args = parser.parse_args()
    config = init_config()
    db = Database(config).get_session()

    try:
        if args.generate:
            generate_empty_template(
                db,
                args.generate,
                include_existing=args.include_existing
            )
            print(f"Template generated at {args.generate}")
            return

        if args.file:
            seed_from_file(db, args.file, mode=args.mode)
            print(f"Seed completed using mode={args.mode}")
            return

        print("No action provided. Use --file or --generate")

    finally:
        db.close()


if __name__ == "__main__":
    main()

# python -m app.db.seeds.cli --file app/db/seeds/data/dev_seed.json --mode append
# python -m app.db.seeds.cli --file dev_seed.json --mode write
# python -m app.db.seeds.cli --file dev_seed.json --mode empty
# python -m app.db.seeds.cli --generate seed_template.json
# python -m app.db.seeds.cli --generate seed_template.json --include-existing