import json
import time
from typing import Callable, Dict, Any, Set, Optional, List

import paho.mqtt.client as paho_mqtt
from paho.mqtt.properties import Properties
from paho.mqtt.reasoncodes import ReasonCode
from paho.mqtt.enums import MQTTErrorCode, CallbackAPIVersion

from mqtt.schema import ErrorBody, MqttResponse, MqttStatus
from logger.protocol import LoggerProto


class MqttClient:
    def __init__(self, broker_uri: str, client_id: str, logger: LoggerProto) -> None:
        self.client = paho_mqtt.Client(
            callback_api_version=CallbackAPIVersion.VERSION2,
            client_id=client_id,
            clean_session=False,
        )
        self.client.on_subscribe = self._on_subscribe
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect

        self.broker_uri = broker_uri
        self.logger = logger
        self.subscribed_topics: Set[str] = set()
        self.disconnected = False
        self.is_user_interrupt = False

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

    def retry_connect(self, retries=5, delay_seconds=5) -> bool:
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
            except ConnectionRefusedError:
                self.logger.error(
                    message=f"[Attempt {conn_attempt}] Connection to the broker was refused"
                )
            except Exception as e:
                self.logger.error(
                    message=f"[Attempt {conn_attempt}] Could not connect to the broker. Unexpected error: {e}"
                )

            time.sleep(delay_seconds)

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
            self.is_user_interrupt = True
        except Exception as e:
            self.logger.error(message=f"Unexpected error in the client loop: {e}")
        finally:
            self.logger.info(message=f"MQTT connection clean-up")
            self.client.disconnect()

    def publish(self, topic: str, message: Dict[str, Any]) -> None:
        try:
            self.logger.info(f"Publishing on topic '{topic}', message '{message}'")
            publish_result = self.client.publish(
                topic=topic, payload=json.dumps(message)
            )
            if publish_result.rc != paho_mqtt.MQTT_ERR_SUCCESS:
                self.logger.error(
                    f"Failed to publish message on topic '{topic}'. Result code: {publish_result.rc}"
                )
        except Exception as e:
            self.logger.error(
                f"Error publishing message on topic '{topic}', message '{message}'. Error: {e}"
            )

    def subscribe(self, topic: str) -> None:
        self.logger.info(f"Subscribing to topic '{topic}'")
        self.client.subscribe(topic=topic)
        self.subscribed_topics.add(topic)

    def set_on_message(
        self, callable: Callable[[paho_mqtt.Client, Any, paho_mqtt.MQTTMessage], None]
    ) -> None:
        self.client._on_message = callable

    def _on_subscribe(
        self,
        client: paho_mqtt.Client,
        userdata: Any,
        mid: int,
        reason_code_list: List[ReasonCode],
        properties: Properties,
    ) -> None:
        if reason_code_list[0].is_failure:
            self.logger.warning(
                f"Broker rejected your subscription: {reason_code_list[0]}"
            )
        else:
            self.logger.info(
                f"Broker granted the following QoS: {reason_code_list[0].value}"
            )

    def _on_connect(
        self,
        client: paho_mqtt.Client,
        userdata: Any,
        connect_flags: paho_mqtt.ConnectFlags,
        reason_code: ReasonCode,
        properties: Optional[Properties],
    ) -> None:
        self.logger.info("Connected to the client")
        if self.disconnected:
            self.logger.info("Re-subscribing to the topics")
            for topic in self.subscribed_topics:
                self.subscribe(topic)
            self.disconnected = False

    def _on_disconnect(
        self,
        client: paho_mqtt.Client,
        userdata: Any,
        disconnect_flags: paho_mqtt.DisconnectFlags,
        reason_code: ReasonCode,
        properties: Optional[Properties],
    ) -> None:
        if self.is_user_interrupt:
            self.logger.info(f"User disconnected from the client")
        else:
            self.logger.warning("Disconnected from the client. Trying to reconnect...")
            self.disconnected = True
            self.retry_connect()
