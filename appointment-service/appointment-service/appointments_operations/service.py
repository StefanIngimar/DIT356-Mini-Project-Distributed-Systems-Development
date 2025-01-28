from typing import Dict, Any

from paho.mqtt.client import Client, MQTTMessage

from logger.protocol import LoggerProto

from mqtt.client import MqttClient
from mqtt.router import MqttRouterProto
from mqtt.schema import Topic
from config.app import AppConfig


class AppointmentService:
    def __init__(
        self, logger: LoggerProto, app_config: AppConfig, client_id="appointment-service"
    ) -> None:
        self.logger = logger
        self.client = MqttClient(
            broker_uri=app_config.MQTT_BROKER,
            client_id=client_id,
            logger=self.logger,
        )
        self.mounted_routers: Dict[Topic, MqttRouterProto] = dict()

    def mount_router(self, topic: str, router: MqttRouterProto) -> None:
        self.mounted_routers[topic] = router

    def listen_and_serve(self) -> None:
        connected = self.client.retry_connect()
        if not connected:
            return

        self._subscribe_to_registered_topics()
        self.client.set_on_message(self._dispatch_message)

        self.client.start_loop()

    def _dispatch_message(
        self, client: Client, userdata: Any, msg: MQTTMessage
    ) -> None:
        router = self.mounted_routers.get(msg.topic, None)
        if router is not None:
            router.serve(client=client, userdata=userdata, msg=msg)
        else:
            # NOTE: this should not happen
            self.logger.warning(message=f"No router mounted for topic '{msg.topic}'")

    def _subscribe_to_registered_topics(self) -> None:
        for topic in self.mounted_routers:
            self.client.subscribe(topic)
