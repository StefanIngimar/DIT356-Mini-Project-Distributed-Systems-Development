from typing import TypeVar, Generic, Optional, Union
from enum import Enum
from dataclasses import dataclass


T = TypeVar("T")


class DbErrorType(Enum):
    UNKNOWN_ERROR = 0
    RECORD_ALREADY_EXIST = 1
    RECORD_NOT_FOUND = 2


@dataclass
class DbSuccess(Generic[T]):
    data: T


@dataclass
class DbError:
    message: str
    details: str
    error_type: DbErrorType


# NOTE: this dataclass is meant to mimic a bit of a Rust's result type
# Check for reference: https://doc.rust-lang.org/std/result/
@dataclass
class DbResult(Generic[T]):
    result: Union[DbSuccess[T], DbError]

    @staticmethod
    def as_success(data: T) -> "DbResult[T]":
        return DbResult(result=DbSuccess(data=data))

    @staticmethod
    def as_error(message: str, details: str, error_type: DbErrorType) -> "DbResult[T]":
        return DbResult(
            result=DbError(message=message, details=details, error_type=error_type),
        )

    def is_ok(self) -> bool:
        return isinstance(self.result, DbSuccess)

    def is_err(self) -> bool:
        return isinstance(self.result, DbError)

    def unwrap(self) -> T:
        if isinstance(self.result, DbSuccess):
            return self.result.data
        raise ValueError("Unwrapping on error")

    def unwrap_err(self) -> DbError:
        if isinstance(self.result, DbError):
            return self.result
        raise ValueError("Unwrapping error on success")
