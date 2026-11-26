import pytest

from tests.features.item.fixtures import (
    item_resolution_factory,
    item_summary_factory,
)


@pytest.mark.medium
class ResolveItemsHandler_test:
    def functionality_test(self, item_client, database):
        item = item_summary_factory()
        resolution = item_resolution_factory()
        database.item.resolve.return_value = ([resolution], 4000)

        response = item_client.post(
            "/items/resolve",
            json={
                "items": [
                    {
                        "productId": item.product_id,
                        "quantity": item.quantity,
                    },
                ],
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["items"][0]["product"]["id"] == resolution.product.id
        assert body["items"][0]["lineTotalCent"] == 4000
        assert body["totalCent"] == 4000
        database.item.resolve.assert_called_once_with([item])

    def resolves_an_empty_batch_test(self, item_client, database):
        database.item.resolve.return_value = ([], 0)

        response = item_client.post(
            "/items/resolve",
            json={"items": []},
        )

        assert response.status_code == 200
        assert response.json() == {
            "items": [],
            "totalCent": 0,
        }
        database.item.resolve.assert_called_once_with([])

    def missing_items_returns_validation_error_test(self, item_client):
        response = item_client.post("/items/resolve", json={})

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"

    def incomplete_item_returns_validation_error_test(self, item_client):
        response = item_client.post(
            "/items/resolve",
            json={"items": [{"productId": 11}]},
        )

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"
