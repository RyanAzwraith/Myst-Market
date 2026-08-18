import pytest

from app.core.exceptions import ContentNotFoundException
from app.features.admin.admin_schema import (
    PostUserSearchRequest,
    Registration,
    UserSortBy,
)
from app.features.admin.admin_users_service import (
    get_user_analytics,
    search_users,
)


class get_user_analytics_test:
    def functionality_test(self, session, user, admin_status_seed, order, review):
        result = get_user_analytics(session, user.id)

        assert result.id == user.id
        assert result.order_count == 1
        assert result.spent == order.cost_aud_cent
        assert result.revenue_lost == 0
        assert result.review_count == 1

    def no_activity_test(self, session, user):
        result = get_user_analytics(session, user.id)

        assert result.order_count == 0
        assert result.spent == 0
        assert result.revenue_lost == 0
        assert result.review_count == 0

    def missing_user_test(self, session):
        with pytest.raises(ContentNotFoundException):
            get_user_analytics(session, 500)


class search_users_test:
    def functionality_test(self, session, user, user_seed):
        result = search_users(
            session,
            PostUserSearchRequest(search=user.email),
        )

        assert len(result.users) == 1
        assert result.users[0].id == user.id
        assert not result.has_more

    def registration_filter_test(self, session, user, user_seed):
        result = search_users(
            session,
            PostUserSearchRequest(registration=[Registration.registered]),
        )

        assert result.users
        assert all(user.is_registered for user in result.users)

    def deleted_filter_test(self, session, deactivated_user):
        result = search_users(
            session,
            PostUserSearchRequest(registration=[Registration.deleted]),
        )

        assert len(result.users) == 1
        assert result.users[0].id == deactivated_user.id

    def sorting_test(self, session, user_seed):
        result = search_users(
            session,
            PostUserSearchRequest(
                sort_by=UserSortBy.alphabet,
                is_ascending=True,
            ),
        )

        names = [user.name for user in result.users]
        assert names == sorted(names)

    def pagination_test(self, session, user_seed):
        result = search_users(
            session,
            PostUserSearchRequest(limit=2),
        )

        assert len(result.users) == 2
        assert result.has_more
