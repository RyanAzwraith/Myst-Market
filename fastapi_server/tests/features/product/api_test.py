import pytest

from app.api.dependencies import get_optional_user
from tests.features.media.fixtures import media_detail_factory
from tests.features.product.fixtures import (
    admin_search_params_factory,
    product_analytics_factory,
    product_factory,
    product_fields_factory,
    search_params_factory,
)
from tests.features.review.fixtures import review_result_factory
from tests.features.user.fixtures import current_user_factory


@pytest.mark.medium
class GetProductBySlugHandler_test:
    def functionality_test(self, product_client, database):
        product = product_factory()
        database.product.get_by_slug.return_value = product

        response = product_client.get("/product/battle-axe")

        assert response.status_code == 200
        assert response.json()["product"]["id"] == product.id
        database.product.get_by_slug.assert_called_once_with("battle-axe")


@pytest.mark.medium
class GetProductImageHandler_test:
    def functionality_test(self, product_client, database):
        media = media_detail_factory()
        database.media.get_primary.return_value = media

        response = product_client.get("/product/11/image")

        assert response.status_code == 200
        assert response.json()["media"]["id"] == media.id
        database.media.get_primary.assert_called_once_with("product", 11)


@pytest.mark.medium
class GetProductMediasHandler_test:
    def functionality_test(self, product_client, database):
        media = media_detail_factory()
        database.media.get_all.return_value = [media]

        response = product_client.get("/product/11/medias")

        assert response.status_code == 200
        assert response.json()["medias"][0]["id"] == media.id
        database.media.get_all.assert_called_once_with(
            entity_type="product",
            entity_id=11,
        )


@pytest.mark.medium
class GetProductReviewsHandler_test:
    def functionality_test(self, product_client, database):
        result = review_result_factory()
        database.review.get_for_product.return_value = result

        response = product_client.get("/product/11/reviews")

        assert response.status_code == 200
        body = response.json()
        assert body["reviews"][0]["id"] == 4
        assert body["average"] == 4.5
        assert body["userHasReview"] is False
        database.review.get_for_product.assert_called_once_with(
            11,
            user_id=None,
        )

    def passes_authenticated_user_id_test(
        self,
        product_app,
        product_client,
        database,
    ):
        product_app.dependency_overrides[get_optional_user] = (
            current_user_factory
        )
        database.review.get_for_product.return_value = (
            review_result_factory()
        )

        response = product_client.get("/product/11/reviews")

        assert response.status_code == 200
        database.review.get_for_product.assert_called_once_with(
            11,
            user_id=8,
        )


@pytest.mark.medium
class GetProductAnalyticsHandler_test:
    def functionality_test(self, product_client, database):
        analytics = product_analytics_factory()
        database.product.get_analytics.return_value = analytics

        response = product_client.get("/products/11/analytics")

        assert response.status_code == 200
        assert response.json()["product"]["revenue"] == analytics.revenue
        database.product.get_analytics.assert_called_once_with(11)


@pytest.mark.medium
class CreateProductHandler_test:
    def functionality_test(self, product_client, database):
        fields = product_fields_factory()

        response = product_client.post(
            "/product",
            json={
                "name": fields.name,
                "categoryName": fields.category_name,
                "rarityName": fields.rarity_name,
                "priceAudCent": fields.price_aud_cent,
                "slug": fields.slug,
                "description": fields.description,
                "stock": fields.stock,
            },
        )

        assert response.status_code == 201
        database.product.create.assert_called_once_with(
            name=fields.name,
            category=fields.category_name,
            rarity=fields.rarity_name,
            price_aud_cent=fields.price_aud_cent,
            slug=fields.slug,
            description=fields.description,
            stock=fields.stock,
        )

    def missing_required_fields_returns_validation_error_test(
        self,
        product_client,
    ):
        response = product_client.post("/product", json={})

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"


@pytest.mark.medium
class PatchProductHandler_test:
    def functionality_test(self, product_client, database):
        response = product_client.patch(
            "/products/11",
            json={
                "categoryName": "armaments",
                "priceAudCent": 3000,
                "stock": 4,
            },
        )

        assert response.status_code == 204
        database.product.patch.assert_called_once_with(
            11,
            name=None,
            category="armaments",
            rarity=None,
            price_aud_cent=3000,
            slug=None,
            description=None,
            stock=4,
        )


@pytest.mark.medium
class DeleteProductHandler_test:
    def functionality_test(self, product_client, database):
        response = product_client.delete("/products/11")

        assert response.status_code == 204
        database.product.delete.assert_called_once_with(11)


@pytest.mark.medium
class RetrieveFeaturedProductsHandler_test:
    def functionality_test(self, product_client, database):
        products = [product_factory()]
        images = [media_detail_factory()]
        database.product.get_featured.return_value = products
        database.media.get_primary_for_many.return_value = images

        response = product_client.post(
            "/products/featured",
            json={"limit": 5},
        )

        assert response.status_code == 200
        assert response.json()["products"][0]["id"] == 11
        database.product.get_featured.assert_called_once_with(5)
        database.media.get_primary_for_many.assert_called_once_with(
            "product",
            [11],
        )


@pytest.mark.medium
class RetrievePopularProductsHandler_test:
    def functionality_test(self, product_client, database):
        products = [product_factory()]
        database.product.get_popular.return_value = products
        database.media.get_primary_for_many.return_value = [
            media_detail_factory()
        ]

        response = product_client.post(
            "/products/popular",
            json={"limit": 5},
        )

        assert response.status_code == 200
        assert response.json()["products"][0]["id"] == 11
        database.product.get_popular.assert_called_once_with(5)


@pytest.mark.medium
class RetrieveNewestProductsHandler_test:
    def functionality_test(self, product_client, database):
        products = [product_factory()]
        database.product.get_newest.return_value = products
        database.media.get_primary_for_many.return_value = [
            media_detail_factory()
        ]

        response = product_client.post(
            "/products/newest",
            json={"limit": 5},
        )

        assert response.status_code == 200
        assert response.json()["products"][0]["id"] == 11
        database.product.get_newest.assert_called_once_with(5)


@pytest.mark.medium
class RetrieveMostSoldProductsHandler_test:
    def functionality_test(self, product_client, database):
        products = [product_analytics_factory()]
        database.product.get_most_sold.return_value = products
        database.media.get_primary_for_many.return_value = [
            media_detail_factory()
        ]

        response = product_client.post(
            "/products/most-sold",
            json={"limit": 5},
        )

        assert response.status_code == 200
        assert response.json()["products"][0]["revenue"] == 30000
        database.product.get_most_sold.assert_called_once_with(5)


@pytest.mark.high
class SearchProductsHandler_test:
    def functionality_test(self, product_client, database):
        product = product_factory()
        database.product.search.return_value = ([product], True)
        database.media.get_primary_for_many.return_value = [
            media_detail_factory()
        ]
        params = search_params_factory()

        response = product_client.post(
            "/products/search",
            json={
                "searchParams": {
                    "categories": [
                        category.value for category in params.categories
                    ],
                    "rarities": [
                        rarity.value for rarity in params.rarities
                    ],
                    "sort": params.sort.value,
                    "isAscending": params.is_ascending,
                    "search": params.search,
                },
                "limit": 10,
                "offset": 2,
            },
        )

        assert response.status_code == 200
        assert response.json()["products"][0]["id"] == product.id
        assert response.json()["hasMore"] is True
        database.product.search.assert_called_once_with(
            categories=["weapons"],
            rarities=["rare"],
            search="axe",
            sort="price",
            is_ascending=True,
            limit=10,
            offset=2,
        )


@pytest.mark.high
class AdminSearchProductsHandler_test:
    def functionality_test(self, product_client, database):
        product = product_analytics_factory()
        database.product.search_admin.return_value = ([product], False)
        params = admin_search_params_factory()

        response = product_client.post(
            "/products/search-admin",
            json={
                "searchParams": {
                    "categories": [
                        category.value for category in params.categories
                    ],
                    "rarities": [
                        rarity.value for rarity in params.rarities
                    ],
                    "search": params.search,
                    "isDiscontinued": params.is_discontinued,
                    "sort": params.sort.value,
                    "isAscending": params.is_ascending,
                },
                "limit": 20,
                "offset": 4,
            },
        )

        assert response.status_code == 200
        assert response.json()["products"][0]["id"] == product.id
        assert response.json()["hasMore"] is False
        database.product.search_admin.assert_called_once_with(
            categories=["weapons"],
            rarities=["rare"],
            search="axe",
            is_discontinued=False,
            sort="revenue",
            is_ascending=False,
            limit=20,
            offset=4,
        )


@pytest.mark.medium
class PatchProductsHandler_test:
    def functionality_test(self, product_client, database):
        response = product_client.patch(
            "/products",
            json={
                "productIds": [11, 12],
                "categoryName": "armaments",
                "rarityName": "epic",
                "priceAudCent": 3500,
                "stock": 6,
            },
        )

        assert response.status_code == 204
        database.product.patch_many.assert_called_once_with(
            [11, 12],
            category="armaments",
            rarity="epic",
            price_aud_cent=3500,
            stock=6,
        )
