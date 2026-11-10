from unittest.mock import Mock

import pytest

from app.core.exceptions import AppError
from app.features.user import service as user_service
from tests.features.user.fixtures import user_factory


@pytest.mark.medium
class SendSetPasswordEmail_test:
    def functionality_test(self, configured_user, monkeypatch):
        user = user_factory()
        create_token = Mock(return_value="set-password-token")
        send_email = Mock()
        monkeypatch.setattr(
            user_service,
            "create_set_password_token",
            create_token,
        )
        monkeypatch.setattr(
            user_service.resend.Emails,
            "send",
            send_email,
        )

        user_service.send_set_password_email(user)

        create_token.assert_called_once_with(user.id)
        send_email.assert_called_once()
        email = send_email.call_args.args[0]
        assert email["from"] == "set_password@resend.dev"
        assert email["to"] == user.email
        assert email["subject"] == "Set Password"
        assert (
            "http://localhost:5173/set-password?"
            "token=set-password-token"
        ) in email["html"]

    def resend_failure_raises_app_error_test(
        self,
        configured_user,
        monkeypatch,
    ):
        monkeypatch.setattr(
            user_service,
            "create_set_password_token",
            Mock(return_value="set-password-token"),
        )
        monkeypatch.setattr(
            user_service.resend.Emails,
            "send",
            Mock(side_effect=RuntimeError("provider unavailable")),
        )

        with pytest.raises(AppError, match="Resend not working"):
            user_service.send_set_password_email(user_factory())
