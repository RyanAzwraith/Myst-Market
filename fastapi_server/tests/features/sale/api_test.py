from datetime import date

import pytest

from tests.features.media.fixtures import media_detail_factory
from tests.features.sale.fixtures import (
    admin_search_params_factory,
    sale_analytics_factory,
    sale_factory,
    sale_input_factory,
)


@pytest.mark.medium
class GetSaleBySlugHandler_test:
    def functionality_test(self, sale_client, database):
        sale = sale_factory()
        database.sale.get_by_slug.return_value = sale

        response = sale_client.get("/sale/summer-sale")

        assert response.status_code == 200
        assert response.json()["sale"]["id"] == sale.id
        database.sale.get_by_slug.assert_called_once_with("summer-sale")


@pytest.mark.medium
class GetSaleImageHandler_test:
    def functionality_test(self, sale_client, database):
        media = media_detail_factory()
        database.media.get_primary.return_value = media

        response = sale_client.get("/sale/4/image")

        assert response.status_code == 200
        assert response.json()["media"]["id"] == media.id
        database.media.get_primary.assert_called_once_with("sale", 4)


@pytest.mark.medium
class GetSaleMediasHandler_test:
    def functionality_test(self, sale_client, database):
        media = media_detail_factory()
        database.media.get_all.return_value = [media]

        response = sale_client.get("/sale/4/media")

        assert response.status_code == 200
        assert response.json()["medias"][0]["id"] == media.id
        database.media.get_all.assert_called_once_with(
            entity_type="sale",
            entity_id=4,
        )


@pytest.mark.medium
class GetSaleAnalyticsHandler_test:
    def functionality_test(self, sale_client, database):
        analytics = sale_analytics_factory()
        database.sale.get_analytics.return_value = analytics

        response = sale_client.get("/sale/4/analytics")

        assert response.status_code == 200
        assert response.json()["sale"]["revenue"] == analytics.revenue
        database.sale.get_analytics.assert_called_once_with(4)


@pytest.mark.medium
class PostSaleHandler_test:
    def functionality_test(self, sale_client, database):
        sale_input = sale_input_factory()

        response = sale_client.post(
            "/sale",
            json={
                "name": sale_input.name,
                "slug": sale_input.slug,
                "discountPerc": sale_input.discount_perc,
                "description": sale_input.description,
                "startAt": sale_input.start_at.isoformat(),
                "endAt": sale_input.end_at.isoformat(),
            },
        )

        assert response.status_code == 201
        database.sale.create.assert_called_once_with(
            discount_perc=sale_input.discount_perc,
            start_at=sale_input.start_at,
            end_at=sale_input.end_at,
            name=sale_input.name,
            slug=sale_input.slug,
            description=sale_input.description,
        )

    def missing_required_fields_returns_validation_error_test(
        self,
        sale_client,
    ):
        response = sale_client.post("/sale", json={})

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"


@pytest.mark.medium
class PatchSaleHandler_test:
    def functionality_test(self, sale_client, database):
        response = sale_client.patch(
            "/sale/4",
            json={
                "name": "Updated Sale",
                "discountPercent": 30,
                "startAt": "2026-06-02",
                "endAt": "2026-06-29",
            },
        )

        assert response.status_code == 204
        database.sale.patch.assert_called_once_with(
            4,
            name="Updated Sale",
            slug=None,
            description=None,
            start_at=date(2026, 6, 2),
            end_at=date(2026, 6, 29),
            discount_perc=30,
        )


@pytest.mark.medium
class DeleteSaleHandler_test:
    def functionality_test(self, sale_client, database):
        response = sale_client.delete("/sale/4")

        assert response.status_code == 204
        database.sale.delete.assert_called_once_with(4)


@pytest.mark.medium
class GetSalesHandler_test:
    def functionality_test(self, sale_client, database):
        sale = sale_factory()
        database.sale.get_all.return_value = [sale]

        response = sale_client.get("/sales")

        assert response.status_code == 200
        assert response.json()["sales"][0]["id"] == sale.id
        database.sale.get_all.assert_called_once_with()


@pytest.mark.medium
class PostBiggestSalesHandler_test:
    def functionality_test(self, sale_client, database):
        sales = [sale_factory(sale_id=4), sale_factory(sale_id=5)]
        images = [media_detail_factory()]
        database.sale.get_biggest.return_value = sales
        database.media.get_primary_for_many.return_value = images

        response = sale_client.post("/sales/biggest", json={"limit": 2})

        assert response.status_code == 200
        assert [item["id"] for item in response.json()["sales"]] == [4, 5]
        database.sale.get_biggest.assert_called_once_with(2)
        database.media.get_primary_for_many.assert_called_once_with(
            "sale",
            [4, 5],
        )


@pytest.mark.high
class PostAdminSearchSalesHandler_test:
    def functionality_test(self, sale_client, database):
        analytics = sale_analytics_factory()
        database.sale.search_admin.return_value = ([analytics], True)
        params = admin_search_params_factory()

        response = sale_client.post(
            "/sales/search-admin",
            json={
                "searchParams": {
                    "activation": [
                        activation.value
                        for activation in params.activation
                    ],
                    "isAscending": params.is_ascending,
                    "sort": params.sort.value,
                    "search": params.search,
                },
                "limit": 10,
                "offset": 3,
            },
        )

        assert response.status_code == 200
        assert response.json()["sales"][0]["id"] == analytics.id
        assert response.json()["hasMore"] is True
        database.sale.search_admin.assert_called_once_with(
            search="summer",
            activations=["active", "upcoming"],
            sort_by="discountPerc",
            is_ascending=False,
            limit=10,
            offset=3,
        )


@pytest.mark.medium
class PatchSalesHandler_test:
    def functionality_test(self, sale_client, database):
        response = sale_client.patch(
            "/sales",
            json={
                "ids": [4, 5],
                "startAt": "2026-06-02",
                "endAt": "2026-06-29",
                "discountPercent": 30,
            },
        )

        assert response.status_code == 204
        database.sale.patch_many.assert_called_once()
        call = database.sale.patch_many.call_args
        assert call.args == ([4, 5],)
        assert call.kwargs["discount_perc"] == 30
        assert str(call.kwargs["start_at"]) == "2026-06-02"
        assert str(call.kwargs["end_at"]) == "2026-06-29"
