import pytest


@pytest.mark.medium
class AppErrorHandler_test:
    def functionality_test(self, exception_client, exception_logger):
        response = exception_client.get("/app-error")

        assert response.status_code == 500
        assert response.json() == {
            "name": "AppError",
            "message": "Application failed",
            "details": {},
        }
        exception_logger.app.error.assert_called_once()


@pytest.mark.medium
class AppExceptionHandler_test:
    def functionality_test(self, exception_client, exception_logger):
        response = exception_client.get("/app-exception")

        assert response.status_code == 400
        assert response.json() == {
            "name": "RequestException",
            "message": "Request failed",
            "details": {},
        }
        exception_logger.api.debug.assert_called_once()


@pytest.mark.medium
class ValidationErrorHandler_test:
    def functionality_test(self, exception_client, exception_logger):
        response = exception_client.get("/validation-error")

        assert response.status_code == 500
        body = response.json()
        assert body["name"] == "ValidationError"
        assert body["message"] == "ValidationError"
        assert body["details"][0]["type"] == "missing"
        exception_logger.app.error.assert_called_once()


@pytest.mark.medium
class RequestValidationErrorHandler_test:
    def functionality_test(self, exception_client, exception_logger):
        response = exception_client.get("/request-validation")

        assert response.status_code == 422
        body = response.json()
        assert body["name"] == "RequestValidationError"
        assert body["message"] == "RequestValidationError"
        assert body["details"][0]["loc"] == ["query", "value"]
        exception_logger.api.debug.assert_called_once()


@pytest.mark.medium
class GenericExceptionHandler_test:
    def functionality_test(self, exception_client, exception_logger):
        response = exception_client.get("/generic-error")

        assert response.status_code == 500
        assert response.json() == {
            "name": "RuntimeError",
            "message": "Unexpected failure",
            "details": {},
        }
        exception_logger.app.error.assert_called_once()
