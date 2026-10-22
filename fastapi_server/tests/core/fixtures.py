from types import SimpleNamespace


def config_factory(**overrides):
    values = {
        "environment": "test",
        "stripe_key": "stripe-key",
        "stripe_payment_hook_key": "webhook-key",
        "resend_key": "resend-key",
        "jwt_key": "jwt-key",
        "cors_origins": ["http://localhost:5173"],
        "token_algorithm": "HS256",
        "access_token_minutes": 15,
        "refresh_token_hours": 12,
        "database_implementation": "sqlite",
        "database_url": "sqlite.db",
        "files_implementation": "root",
        "files_url": "files",
        "log_level": "WARNING",
        "log_to_file": False,
    }
    values.update(overrides)
    return SimpleNamespace(**values)
