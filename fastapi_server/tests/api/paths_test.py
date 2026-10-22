import pytest

from app.api.paths import Paths


@pytest.mark.low
class StaticPaths_test:
    def functionality_test(self):
        assert Paths.Auth.login == "/login"
        assert Paths.User.me == "/user/me"
        assert Paths.Products.search == "/products/search"
        assert Paths.Orders.status == "/orders/status"
        assert Paths.Media.get("product", "image.png") == (
            "/media/product/image.png"
        )

    def keeps_admin_routes_at_expected_paths_test(self):
        assert Paths.App.performance == "/performance"
        assert Paths.Sale.create == "/sale"
        assert Paths.Product.analytics(11) == "/products/11/analytics"
        assert Paths.Users.searchAdmin == "/users/search-admin"


@pytest.mark.low
class DynamicPaths_test:
    def functionality_test(self):
        assert Paths.User.order(12) == "/user/orders/12"
        assert Paths.Sale.bySlug("summer-sale") == (
            "/sale/summer-sale"
        )
        assert Paths.Product.medias(11) == "/product/11/medias"
        assert Paths.Review.byId(4) == "/review/4"
        assert Paths.Order.user(12) == "/orders/12/user"

    def preserves_string_identifiers_test(self):
        assert Paths.Sale.bySlug("summer sale") == (
            "/sale/summer sale"
        )
