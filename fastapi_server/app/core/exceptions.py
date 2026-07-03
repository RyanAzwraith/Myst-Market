class AppException(Exception):
    message:str = "Application Exception"
    status_code:int = 500

    def __init__(self, message=None, details:dict|None=None, status_code=None, ):
        self.message = message or self.__class__.message
        self.status_code = status_code or self.__class__.status_code
        self.details = details or {}
        super().__init__(self.message)

    @property
    def name(self):
        return self.__class__.__name__

    def __str__(self):
        return f"{self.name} | {self.message} | {self.details}"

    def __dict__(self):
        return {
            "name": self.name,
            "message": self.message,
            "details": self.details,
        }

# Errors
class AppError(AppException):
    message:str = "Unexpected Internal Error"
    status_code:int = 500

# Exceptions
class AuthenticationException(AppException):
    message = "Unauthenticated"
    status_code = 401

class AuthorizationException(AppException):
    message = "Unauthorized"
    status_code = 403

class ContentNotFoundException(AppException):
    message = "Content Not Found"
    status_code = 404

class ConflictException(AppException):
    message = "Internal Conflict"
    status_code = 409

class ValidationException(AppException):
    message = "Argument validation failed."
    status_code:int = 500

# module exceptions
#   Pydantic - ValidationError
#   Fastapi - RequestValidationError
