import pytest
from pydantic import ValidationError

from app.features.user.schema import (
    AdminSearchParams,
    AdminSort,
    Registration,
)
from tests.features.user.fixtures import (
    admin_search_params_factory,
    user_analytics_factory,
    user_factory,
    user_input_factory,
    user_patch_factory,
)


@pytest.mark.low
class UserSchema_test:
    def functionality_test(self):
        user = user_factory()

        assert user.id == 7
        assert user.email == "user@example.com"
        assert user.is_registered is True

    def accepts_admin_and_guest_flags_test(self):
        user = user_factory(is_admin=True, is_registered=False)

        assert user.is_admin is True
        assert user.is_registered is False


@pytest.mark.low
class UserInputSchema_test:
    def functionality_test(self):
        user_input = user_input_factory()

        assert user_input.email == "new-user@example.com"
        assert user_input.name == "New User"

    def requires_email_and_name_test(self):
        with pytest.raises(ValidationError):
            user_input_factory(email=None)

        with pytest.raises(ValidationError):
            user_input_factory(name=None)


@pytest.mark.low
class UserPatchSchema_test:
    def functionality_test(self):
        patch = user_patch_factory(email="updated@example.com")

        assert patch.email == "updated@example.com"
        assert patch.name == "Updated User"

    def permits_omitted_fields_test(self):
        patch = user_patch_factory(email=None, name=None)

        assert patch.email is None
        assert patch.name is None


@pytest.mark.low
class UserAnalyticsSchema_test:
    def functionality_test(self):
        analytics = user_analytics_factory()

        assert analytics.order_count == 3
        assert analytics.spent == 4500
        assert analytics.deleted_at is None


@pytest.mark.low
class AdminSearchParamsSchema_test:
    def functionality_test(self):
        params = admin_search_params_factory()

        assert params.sort_by is AdminSort.alphabet
        assert params.registration == [
            Registration.registered,
            Registration.guest,
        ]
        assert params.is_ascending is False

    def rejects_missing_required_search_fields_test(self):
        with pytest.raises(ValidationError):
            AdminSearchParams.model_validate({})
