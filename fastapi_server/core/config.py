import os
from dotenv import load_dotenv
from types import SimpleNamespace

load_dotenv()

def validate_env_var(name:str, required:bool=True, default:str|bool=None, isBool=False):
    var = os.getenv(name, default)
    
    if var is None and required:
        raise RuntimeError(f"Missing required env var: {name}")
    if isBool:
        return var.lower() in {"1", "true", "yes", "y", "on"}
    
    return var

def init_config():
    return SimpleNamespace(
        database_url=validate_env_var("DATABASE_URL", required=True),
        log_level=validate_env_var("LOG_LEVEL", required=False, default="WARNING"),
        log_to_file=validate_env_var("LOG_TO_FILE", required=False, default="false", isBool=True),
    )

