import pytest
from fastapi.routing import APIRoute


@pytest.mark.medium
class Router_test:
    def functionality_test(self, router_client):
        response = router_client.get("/health")

        assert response.status_code == 200
        assert response.json() == 200

    def includes_feature_routes_test(self, router_app):
        paths = {
            route.path
            for route in router_app.routes
            if isinstance(route, APIRoute)
        }

        assert "/stats" in paths
        assert "/product/{id}/image" in paths
        assert "/orders/recent" in paths
        assert "/media/{entity_type}/{file_name}" in paths
