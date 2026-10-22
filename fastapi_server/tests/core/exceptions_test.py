import pytest

from app.core.exceptions import (
    AppError,
    AppException,
    AuthenticationException,
    AuthorizationException,
    ConflictException,
    ContentNotFoundException,
    RequestException,
    ValidationException,
)


@pytest.mark.low
class AppException_test:
    def functionality_test(self):
        exception = AppException(
            "Something failed",
            details={"field": "value"},
            status_code=418,
        )

        assert exception.name == "AppException"
        assert exception.message == "Something failed"
        assert exception.details == {"field": "value"}
        assert exception.status_code == 418
        assert str(exception) == (
            "AppException | Something failed | {'field': 'value'}"
        )

    def uses_default_values_test(self):
        exception = AppException()

        assert exception.message == "Application Exception"
        assert exception.status_code == 500
        assert exception.details == {}

    def exposes_error_payload_test(self):
        exception = RequestException(
            "Missing input",
            details={"field": "email"},
        )

        assert exception.__dict__() == {
            "name": "RequestException",
            "message": "Missing input",
            "details": {"field": "email"},
        }


@pytest.mark.low
class ExceptionDefaults_test:
    @pytest.mark.parametrize(
        ("exception_type", "status_code", "message"),
        [
            (AppError, 500, "Unexpected Internal Error"),
            (AuthenticationException, 401, "Unauthenticated"),
            (AuthorizationException, 403, "Unauthorized"),
            (ContentNotFoundException, 404, "Content Not Found"),
            (ConflictException, 409, "Internal Conflict"),
            (ValidationException, 500, "Argument validation failed."),
            (RequestException, 400, "Request missing something."),
        ],
    )
    def functionality_test(
        self,
        exception_type,
        status_code,
        message,
    ):
        exception = exception_type()

        assert exception.status_code == status_code
        assert exception.message == message
