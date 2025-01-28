from typing import TypeVar, Generic, Optional, Union
from dataclasses import dataclass
from enum import Enum

T = TypeVar('T')

class DbErrorType(Enum):
    UNKNOWN_ERROR = 0
    RECORD_ALREADY_EXISTS = 1
    RECORD_NOT_FOUND = 2

@dataclass
class Result(Generic[T]):
    data: T

@dataclass
class Error:
    message: str
    details: str
    error_type: DbErrorType



@dataclass
class Response(Generic[T]):
    result: Optional[Result[T]] = None
    error: Optional[Error] = None

    @staticmethod
    def as_success(data: T) -> 'Response[T]':
        return Response(result=Result(data), error=None)

    @staticmethod
    def as_error(message: str, details: str, error_type: DbErrorType) -> 'Response[T]':
        return Response(result=None, error=Error(message=message, details=details, error_type=error_type))
    
    def is_ok(self) -> bool:
        return self.result is not None
    
    def is_err(self) -> bool:
        return self.error is not None
    
    def unwrap(self) -> T:
        if self.result:
            return self.result.data
        raise ValueError("Cannot unwrap error response")
    
    def unwrap_error(self) -> str:
        if self.error:
            return self.result
        raise ValueError("Cannot unwrap error response")