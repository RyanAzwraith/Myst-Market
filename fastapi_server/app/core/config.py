import os
from types import SimpleNamespace
from dotenv import load_dotenv
from app.utils.create_singleton import create_singleton

environment = os.getenv("ENVIRONMENT", "dev")
load_dotenv(f".{environment}.env")

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
    return  SimpleNamespace(
        environment=environment,
        stripe_key=validate_env_var("STRIPE_KEY", required=True),
        stripe_payment_hook_key=validate_env_var("STRIPE_PAYMENT_HOOK_KEY", required=True),
        resend_key=validate_env_var("RESEND_KEY", required=True),
        jwt_key=validate_env_var("JWT_KEY", required=True),
        cors_origins=to_list(validate_env_var("CORS_ORIGINS", required=True)),
        token_algorithm=validate_env_var("TOKEN_ALGORITHM", required=True),
        access_token_minutes=to_int(validate_env_var("ACCESS_TOKEN_MINUTES", required=False, default="15")),
        refresh_token_hours=to_int(validate_env_var("REFRESH_TOKEN_HOURS", required=False, default="12")),
        database_implementation=validate_env_var("DATABASE_IMPLEMENTATION", required=True),
        database_url=validate_env_var("DATABASE_URL", required=True),
        files_implementation=validate_env_var("FILES_IMPLEMENTATION", required=True),
        files_url=validate_env_var("FILES_URL", required=True),
        log_level=validate_env_var("LOG_LEVEL", required=False, default="WARNING"),
        log_to_file=to_bool(validate_env_var("LOG_TO_FILE", required=False, default="false")),
    )


init_config, get_config = create_singleton(create_config)