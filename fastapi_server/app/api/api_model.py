from pydantic import BaseModel, ConfigDict
from app.utils.to_camel import to_camel

class APIModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
    )