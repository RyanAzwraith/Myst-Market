import pytest

from app.core import config as config_module


@pytest.mark.low
class ValidateEnvVar_test:
    def functionality_test(self, monkeypatch):
        monkeypatch.setenv("CORE_TEST_VALUE", "configured")

        assert config_module.validate_env_var(
            "CORE_TEST_VALUE",
        ) == "configured"

    def returns_optional_default_test(self, monkeypatch):
        monkeypatch.delenv("CORE_MISSING_VALUE", raising=False)

        assert config_module.validate_env_var(
            "CORE_MISSING_VALUE",
            required=False,
            default="fallback",
        ) == "fallback"

    def rejects_missing_required_value_test(self, monkeypatch):
        monkeypatch.delenv("CORE_MISSING_VALUE", raising=False)

        with pytest.raises(
            RuntimeError,
            match="Missing required env var: CORE_MISSING_VALUE=None",
        ):
            config_module.validate_env_var("CORE_MISSING_VALUE")


@pytest.mark.low
class ConfigConversionHelpers_test:
    def functionality_test(self):
        assert config_module.to_bool("true") is True
        assert config_module.to_bool("0") is False
        assert config_module.to_int("15") == 15
        assert config_module.to_list(" one, two ,, three ") == [
            "one",
            "two",
            "three",
        ]

    def rejects_invalid_integer_test(self):
        with pytest.raises(ValueError):
            config_module.to_int("not-an-integer")


@pytest.mark.low
class CreateConfig_test:
    def functionality_test(self, monkeypatch):
        values = {
            "STRIPE_KEY": "stripe",
            "STRIPE_PAYMENT_HOOK_KEY": "hook",
            "RESEND_KEY": "resend",
            "JWT_KEY": "jwt",
            "CORS_ORIGINS": "http://one, http://two",
            "TOKEN_ALGORITHM": "HS256",
            "DATABASE_IMPLEMENTATION": "sqlite",
            "DATABASE_URL": "sqlite.db",
            "FILES_IMPLEMENTATION": "root",
            "FILES_URL": "files",
            "ACCESS_TOKEN_MINUTES": "20",
            "REFRESH_TOKEN_HOURS": "24",
            "LOG_LEVEL": "INFO",
            "LOG_TO_FILE": "true",
        }
        for name, value in values.items():
            monkeypatch.setenv(name, value)
        monkeypatch.setattr(config_module, "environment", "test")

        result = config_module.create_config()

        assert result.environment == "test"
        assert result.cors_origins == ["http://one", "http://two"]
        assert result.access_token_minutes == 20
        assert result.refresh_token_hours == 24
        assert result.log_to_file is True

    def uses_optional_defaults_test(self, monkeypatch):
        required_values = {
            "STRIPE_KEY": "stripe",
            "STRIPE_PAYMENT_HOOK_KEY": "hook",
            "RESEND_KEY": "resend",
            "JWT_KEY": "jwt",
            "CORS_ORIGINS": "http://localhost",
            "TOKEN_ALGORITHM": "HS256",
            "DATABASE_IMPLEMENTATION": "sqlite",
            "DATABASE_URL": "sqlite.db",
            "FILES_IMPLEMENTATION": "root",
            "FILES_URL": "files",
        }
        for name, value in required_values.items():
            monkeypatch.setenv(name, value)
        monkeypatch.delenv("ACCESS_TOKEN_MINUTES", raising=False)
        monkeypatch.delenv("REFRESH_TOKEN_HOURS", raising=False)
        monkeypatch.delenv("LOG_LEVEL", raising=False)
        monkeypatch.delenv("LOG_TO_FILE", raising=False)

        result = config_module.create_config()

        assert result.access_token_minutes == 15
        assert result.refresh_token_hours == 12
        assert result.log_level == "WARNING"
        assert result.log_to_file is False
