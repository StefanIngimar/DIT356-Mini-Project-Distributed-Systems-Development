import json
import time
from typing import Callable, Dict, Any

import paho.mqtt.client as paho_mqtt
from paho.mqtt.enums import MQTTErrorCode, CallbackAPIVersion

from mqtt.schema import ErrorBody, MqttResponse, MqttStatus
from logger.protocol import LoggerProto


class MqttClient:
    def __init__(self, broker_uri: str, client_id: str, logger: LoggerProto) -> None:
        self.client = paho_mqtt.Client(
            callback_api_version=CallbackAPIVersion.VERSION2, client_id=client_id
        )
        self.client.on_subscribe = self._on_subscribe

        self.broker_uri = broker_uri
        self.logger = logger

    @staticmethod
    def send_error_response(
        client: paho_mqtt.Client,
        origin_topic: str,
        message_id: str,
        status_code: MqttStatus,
        error_msg: str,
        details: str,
    ) -> None:
        MqttClient.send_response(
            client=client,
            origin_topic=origin_topic,
            message_id=message_id,
            status_code=status_code,
            payload=ErrorBody(
                message=error_msg,
                details=details,
            ),
        )

    @staticmethod
    def send_response(
        client: paho_mqtt.Client,
        origin_topic: str,
        message_id: str,
        status_code: MqttStatus,
        payload: Any,
    ) -> None:
        destination_topic = origin_topic.replace("/req", "/res")
        response = MqttResponse(msgId=message_id, status=status_code, data=payload)
        client.publish(topic=destination_topic, payload=response.model_dump_json())

    def retry_connect(self, retries=3, delay_seconds=5) -> bool:
        for conn_attempt in range(1, retries + 1):
            try:
                error_code: MQTTErrorCode = self.client.connect(self.broker_uri)
                if error_code == paho_mqtt.MQTT_ERR_SUCCESS:
                    self.logger.info(
                        message=f"Connected to the broker: {self.broker_uri}"
                    )
                    return True
                self.logger.warning(
                    message=f"[Attempt {conn_attempt}] Could not connect to the broker: {error_code}. Retrying..."
                )
                time.sleep(delay_seconds)
            except ConnectionRefusedError:
                self.logger.error(
                    message="Connection to the broker was refused on the socket level"
                )
                return False

        self.logger.error(
            message="Could not connect to the broker after multiple attempts"
        )
        return False

    def start_loop(self) -> None:
        try:
            error_code: MQTTErrorCode = self.client.loop_forever()
            if error_code == paho_mqtt.MQTT_ERR_SUCCESS:
                self.logger.info(message="Client loop started successfully")
            else:
                self.logger.error(message=f"Error in the client loop: {error_code}")
        except KeyboardInterrupt:
            self.logger.info(message="Client loop stopped by user")
        except Exception as e:
            self.logger.error(message=f"Unexpected error in the client loop: {e}")
        finally:
            self.logger.info(message=f"MQTT connection clean-up")
            self.client.disconnect()

    def publish(self, topic: str, message: Dict[str, Any]) -> None:
        self.client.publish(topic=topic, payload=json.dumps(message))

    def subscribe(self, topic: str) -> None:
        self.client.subscribe(topic=topic)

    def set_on_message(
        self, callable: Callable[[paho_mqtt.Client, Any, paho_mqtt.MQTTMessage], None]
    ) -> None:
        self.client._on_message = callable

    def _on_subscribe(
        self, client, userdata, mid, reason_code_list, properties
    ) -> None:
        if reason_code_list[0].is_failure:
            self.logger.warning(
                f"Broker rejected your subscription: {reason_code_list[0]}"
            )
        else:
            self.logger.info(
                f"Broker granted the following QoS: {reason_code_list[0].value}"
            )
