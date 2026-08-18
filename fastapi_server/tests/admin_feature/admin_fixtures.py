import pytest

from app.db.models import Status


@pytest.fixture
def admin_status_seed(session):
    statuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Error",
    ]
    session.add_all(Status(name=name) for name in statuses)
    session.commit()
    return session.query(Status).all()
