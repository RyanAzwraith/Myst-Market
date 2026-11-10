from datetime import date, timedelta

import pytest

from app.core.exceptions import ConflictException, ContentNotFoundException
from tests.implementations.database.sqlite.fixtures import (
    sale_model_factory,
)


@pytest.mark.medium
class SqliteSaleGetAll_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                sale_model_factory(
                    sale_id=1,
                    start_at=date.today() - timedelta(days=2),
                ),
                sale_model_factory(
                    sale_id=2,
                    slug="new-sale",
                    start_at=date.today() - timedelta(days=1),
                ),
            ]
        )
        sqlite_session.commit()

        result = session_database.sale.get_all()

        assert [sale.id for sale in result] == [2, 1]

    def gets_by_slug_test(self, session_database, sqlite_session):
        sqlite_session.add(sale_model_factory())
        sqlite_session.commit()

        assert session_database.sale.get_by_slug(
            "summer-sale"
        ).discount_perc == 20

    def raises_for_missing_sale_test(self, session_database):
        with pytest.raises(
            ContentNotFoundException,
            match="Sale Not Found",
        ):
            session_database.sale.get(99)


@pytest.mark.medium
class SqliteSaleCreate_test:
    def functionality_test(self, session_database):
        result = session_database.sale.create(
            discount_perc=30,
            start_at=date.today(),
            end_at=date.today() + timedelta(days=5),
            name="New Sale",
            slug="new-sale",
            description=None,
        )

        assert result.name == "New Sale"
        assert result.description == ""

    def rejects_duplicate_slugs_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add(sale_model_factory())
        sqlite_session.commit()

        with pytest.raises(
            ConflictException,
            match="slug already exists",
        ):
            session_database.sale.create(
                discount_perc=10,
                start_at=date.today(),
                end_at=date.today(),
                name="Other",
                slug="summer-sale",
                description="Other",
            )


@pytest.mark.medium
class SqliteSalePatchMany_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                sale_model_factory(sale_id=1),
                sale_model_factory(sale_id=2, slug="other-sale"),
            ]
        )
        sqlite_session.commit()

        session_database.sale.patch_many(
            [1, 2],
            discount_perc=50,
        )

        assert sqlite_session.get(
            type(sale_model_factory()),
            1,
        ).discount_perc == 50
        assert sqlite_session.get(
            type(sale_model_factory()),
            2,
        ).discount_perc == 50

    def reports_missing_ids_test(self, session_database, sqlite_session):
        sqlite_session.add(sale_model_factory())
        sqlite_session.commit()

        with pytest.raises(
            ContentNotFoundException,
            match="Sale Not Found",
        ) as error:
            session_database.sale.patch_many([1, 3])

        assert error.value.details == {"sale_id": 3}


@pytest.mark.medium
class SqliteSaleAvailability_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                sale_model_factory(
                    sale_id=1,
                    discount_perc=10,
                    end_at=date.today() + timedelta(days=1),
                ),
                sale_model_factory(
                    sale_id=2,
                    slug="expired-sale",
                    discount_perc=50,
                    start_at=date.today() - timedelta(days=4),
                    end_at=date.today() - timedelta(days=1),
                ),
            ]
        )
        sqlite_session.commit()

        result = session_database.sale.get_biggest(10)

        assert [sale.id for sale in result] == [1]
        assert session_database.sale.count_ending_within(2) == 1

    def rejects_negative_period_test(self, session_database):
        with pytest.raises(ValueError, match="non-negative"):
            session_database.sale.count_ending_within(-1)
