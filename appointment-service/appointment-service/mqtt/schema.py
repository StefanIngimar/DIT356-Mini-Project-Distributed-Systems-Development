from enum import Enum
from typing import TypeVar, Generic, TypeAlias
from enum import Enum

from pydantic import BaseModel

T = TypeVar("T")


Topic: TypeAlias = str


class HttpMethod(str, Enum):
    GET = "GET"
    PUT = "PUT"
    POST = "POST"
    DELETE = "DELETE"


class MqttStatus(Enum):
    STATUS_200_OK = 200
    STATUS_201_CREATED = 201
    STATUS_400_BAD_REQUEST = 400
    STATUS_401_UNAUTHORIZED = 401
    STATUS_404_NOT_FOUND = 404
    STATUS_500_INTERNAL_ERROR = 500


class MqttRequest(BaseModel, Generic[T]):
    msgId: str
    method: HttpMethod
    path: str
    data: T


class MqttResponse(BaseModel, Generic[T]):
    msgId: str
    status: MqttStatus
    data: T


class ErrorBody(BaseModel):
    message: str
    details: str
