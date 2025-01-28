from mqtt.client import MqttClient
from mqtt.schema import HttpMethod, MqttStatus


# NOTE: it is easier not to inherit from 'Exception' and just treat those 'MqttException' classes as functions... kind-of
# since, raising an exception stops the program, we can just initialize the below class which act's as throwing an error
class MqttException:
    def __init__(
        self,
        client,
        topic: str,
        message_id: str,
        status_code: MqttStatus,
        error_msg: str,
        details: str,
    ) -> None:
        self.client = client
        self.topic = topic
        self.message_id = message_id
        self.status_code = status_code
        self.error_msg = error_msg
        self.details = details

        self.handle_error()

    def handle_error(self) -> None:
        MqttClient.send_error_response(
            client=self.client,
            origin_topic=self.topic,
            message_id=self.message_id,
            status_code=self.status_code,
            error_msg=self.error_msg,
            details=self.details,
        )


class MqttInvalidDataFormat(MqttException):
    def __init__(self, client, message_id: str, topic: str, details: str) -> None:
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,  # NOTE: could not parse the payload, since no message id
            status_code=MqttStatus.STATUS_400_BAD_REQUEST,
            error_msg="Invalid data format",
            details=details,
        )


class MqttHandlerNotFoundForMethod(MqttException):
    def __init__(self, client, topic: str, message_id: str, method: HttpMethod) -> None:
        error_msg = f"No handlers found for method '{method.value}'"
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,
            status_code=MqttStatus.STATUS_404_NOT_FOUND,
            error_msg=error_msg,
            details=error_msg,
        )


class MqttHandlerNotFoundForMethodAndPath(MqttException):
    def __init__(
        self, client, topic: str, message_id: str, method: HttpMethod, path: str
    ) -> None:
        error_msg = f"No handler found for method '{method.value}' and path '{path}'"
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,
            status_code=MqttStatus.STATUS_404_NOT_FOUND,
            error_msg=error_msg,
            details=error_msg,
        )


class MqttUnauthorized(MqttException):
    def __init__(self, client, topic: str, message_id: str) -> None:
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,
            status_code=MqttStatus.STATUS_401_UNAUTHORIZED,
            error_msg="Invalid email or password",
            details="Invalid email or password",
        )


# Database specific exceptions


class MqttDatabaseRecordAlreadyExist(MqttException):
    def __init__(
        self, client, topic: str, message_id: str, error_msg: str, details: str
    ) -> None:
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,
            status_code=MqttStatus.STATUS_400_BAD_REQUEST,
            error_msg=error_msg,
            details=details,
        )


class MqttDatabaseRecordNotFound(MqttException):
    def __init__(
        self, client, topic: str, message_id: str, error_msg: str, details: str
    ) -> None:
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,
            status_code=MqttStatus.STATUS_404_NOT_FOUND,
            error_msg=error_msg,
            details=details,
        )


class MqttDatabaseUnexpectedError(MqttException):
    def __init__(
        self, client, topic: str, message_id: str, error_msg: str, details: str
    ) -> None:
        super().__init__(
            client=client,
            topic=topic,
            message_id=message_id,
            status_code=MqttStatus.STATUS_500_INTERNAL_ERROR,
            error_msg=error_msg,
            details=details,
        )
