import pytest
from pydantic import ValidationError

from tests.features.auth.fixtures import login_factory


@pytest.mark.low
class LoginSchema_test:
    def functionality_test(self):
        login = login_factory()

        assert login.email == "user@example.com"
        assert login.password == "correct-password"

    def accepts_custom_credentials_test(self):
        login = login_factory(
            email="other@example.com",
            password="different-password",
        )

        assert login.email == "other@example.com"
        assert login.password == "different-password"

    def requires_email_and_password_test(self):
        with pytest.raises(ValidationError):
            login_factory(email=None)

        with pytest.raises(ValidationError):
            login_factory(password=None)
