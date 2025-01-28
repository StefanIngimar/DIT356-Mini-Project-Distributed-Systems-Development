from db.dataclasses import DbError, DbErrorType

from paho.mqtt.client import Client, MQTTMessage

from mqtt.schema import MqttRequest
from mqtt.exceptions import (
    MqttDatabaseRecordAlreadyExist,
    MqttDatabaseRecordNotFound,
    MqttDatabaseUnexpectedError,
)


def handle_db_error(
    err: DbError, client: Client, msg: MQTTMessage, payload: MqttRequest
):
    if err.error_type == DbErrorType.RECORD_ALREADY_EXIST:
        MqttDatabaseRecordAlreadyExist(
            client=client,
            topic=msg.topic,
            message_id=payload.msgId,
            error_msg=err.message,
            details=err.details,
        )
    elif err.error_type == DbErrorType.RECORD_NOT_FOUND:
        MqttDatabaseRecordNotFound(
            client=client,
            topic=msg.topic,
            message_id=payload.msgId,
            error_msg=err.message,
            details=err.details,
        )
    else:
        MqttDatabaseUnexpectedError(
            client=client,
            topic=msg.topic,
            message_id=payload.msgId,
            error_msg=err.message,
            details=err.details,
        )
