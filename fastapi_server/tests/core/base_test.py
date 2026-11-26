from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.core.Base import Base


class ExampleModel(Base):
    first_name: str
    item_count: int


@pytest.mark.low
class BaseModel_test:
    def functionality_test(self):
        model = ExampleModel.model_validate(
            {
                "firstName": "Test",
                "itemCount": 3,
            },
        )

        assert model.first_name == "Test"
        assert model.item_count == 3
        assert model.model_dump(by_alias=True) == {
            "firstName": "Test",
            "itemCount": 3,
        }

    def validates_from_attributes_test(self):
        source = SimpleNamespace(
            first_name="From attributes",
            item_count=4,
        )

        model = ExampleModel.model_validate(source)

        assert model.first_name == "From attributes"
        assert model.item_count == 4

    def rejects_missing_fields_test(self):
        with pytest.raises(ValidationError):
            ExampleModel.model_validate({})
