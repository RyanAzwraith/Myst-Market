from fastapi.responses import JSONResponse

class AppException(Exception):
    message:str = "Application Error"
    status_code:int = 500

    def __init_subclass__(cls):
        if any([
            not isinstance(cls.status_code, int),
            not isinstance(cls.message, str)
        ]):
            raise TypeError(f"{cls.__name__} class properties type validation failed")

    def __init__(self, details:dict|None):
        self.message = self.__class__.message
        self.status_code = self.__class__.status_code
        self.details = details or {}
        super().__init__(self.message)

    def response(self) -> JSONResponse:
        return JSONResponse( status_code=self.status_code, content={
            "error": {
                "status_code": self.status_code,
                "message": self.message,
                "details": self.details,
            }
        },)


class AppValidationError(AppException):
    status_code = 500 
    message = "Argument validation failed."

class AppTypeError(AppValidationError):
    status_code = 500 
    message = "Argument validation failed, incorrect type."

class AppMissingFieldError(AppValidationError):
    status_code = 500 
    message = "Argument validation failed, missing field."