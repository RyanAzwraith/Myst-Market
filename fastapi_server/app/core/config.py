import os
from dotenv import load_dotenv
from types import SimpleNamespace

from app.utils.create_singleton import create_singleton

load_dotenv()

def validate_env_var(name:str, required:bool=True, default:str|bool=None):
    var = os.getenv(name, default)
    if var is None and required:
        raise RuntimeError(f"Missing required env var: {name}={var}")
    return var

def to_bool(var:str):
    return var.lower() in {"1", "true", "yes", "y", "on"}

def to_int(var:str):
    return int(var)

def to_list(var:str):
    return [v.strip() for v in var.split(",") if v.strip()]
        

def create_config():
    environment=validate_env_var("ENVIRONMENT", required=True).lower()
    match environment:
        case "development" | "dev":
            database_url=validate_env_var("DATABASE_URL", required=True)
            stripe_key=validate_env_var("STRIPE_KEY", required=True)
            stripe_payment_hook_key=validate_env_var("STRIPE_PAYMENT_HOOK_KEY", required=True)
            resend_key=validate_env_var("RESEND_KEY", required=True)
            jwt_key=validate_env_var("JWT_KEY", required=True)

        case "test" | "testing":
            database_url=validate_env_var("TEST_DATABASE_URL", required=True)
            stripe_key=validate_env_var("STRIPE_KEY", required=True)
            stripe_payment_hook_key=validate_env_var("STRIPE_PAYMENT_HOOK_KEY", required=True)
            resend_key = "stripe_key_dummy_test"
            jwt_key = "jwt_key_very_very_very_long_stupid_stupid_dummy_test_for_testing"
        case _:
            raise RuntimeError("Missing required env var: ENVIRONMENT={environment}")


    return  SimpleNamespace(
        database_url=database_url,
        environment=environment,
        stripe_key=stripe_key,
        stripe_payment_hook_key=stripe_payment_hook_key,
        resend_key=resend_key,
        jwt_key=jwt_key,
        log_level=validate_env_var("LOG_LEVEL", required=False, default="WARNING"),
        log_to_file=to_bool(validate_env_var("LOG_TO_FILE", required=False, default="false")),
        cors_origins=to_list(validate_env_var("CORS_ORIGINS", required=True)),
        access_token_minutes=to_int(validate_env_var("ACCESS_TOKEN_MINUTES", required=False, default="15")),
        refresh_token_hours=to_int(validate_env_var("REFRESH_TOKEN_HOURS", required=False, default="12")),
    )


init_config, get_config = create_singleton(create_config)