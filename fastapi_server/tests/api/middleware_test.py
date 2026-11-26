import pytest


@pytest.mark.medium
class LogRequestsMiddleware_test:
    def functionality_test(self, middleware_client, middleware_logger):
        response = middleware_client.post(
            "/echo",
            json={"message": "hello"},
            headers={"Authorization": "Bearer token"},
        )

        assert response.status_code == 200
        assert response.json() == {"ok": True}
        middleware_logger.requests.debug.assert_called_once()
        message = middleware_logger.requests.debug.call_args.args[0]
        assert "POST" in message
        assert "/echo" in message
        assert "Bearer token" in message
        assert '"message"' in message
        assert '"hello"' in message
        assert "res: 200" in message


@pytest.mark.medium
class CorsMiddleware_test:
    def functionality_test(self, middleware_client):
        response = middleware_client.options(
            "/echo",
            headers={
                "Origin": "http://frontend.test",
                "Access-Control-Request-Method": "POST",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == (
            "http://frontend.test"
        )
        assert response.headers["access-control-allow-credentials"] == (
            "true"
        )
