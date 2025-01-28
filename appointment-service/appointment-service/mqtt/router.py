import json
from collections import defaultdict
from typing import (
    Callable,
    Protocol,
    Dict,
    TypeAlias,
    DefaultDict,
    Optional,
    Any,
    Tuple,
)

from paho.mqtt.client import Client, MQTTMessage

from mqtt.schema import MqttRequest, HttpMethod
from mqtt.exceptions import (
    MqttInvalidDataFormat,
    MqttHandlerNotFoundForMethod,
    MqttHandlerNotFoundForMethodAndPath,
)

Path: TypeAlias = str
Params: TypeAlias = Dict[str, str]
MessageHandler: TypeAlias = Callable[
    [Client, Any, MQTTMessage, Optional[Params], MqttRequest[Any]], None
]


class MqttRouterProto(Protocol):
    def serve(self, client, userdata, msg) -> None:
        pass


class MqttRouter:
    def __init__(self) -> None:
        self.registered_routes: DefaultDict[HttpMethod, Dict[Path, MessageHandler]] = (
            defaultdict(dict)
        )

    def register_route(
        self, method: HttpMethod, path: Path, handler: MessageHandler
    ) -> None:
        self.registered_routes[method][path] = handler

    def serve(self, client: Client, userdata: Any, msg: MQTTMessage) -> None:
        response_topic = msg.topic.replace("/req", "/res")
        try:
            raw_payload = msg.payload.decode()
            print("Raw MQTT Payload:", raw_payload)
            mqtt_request = MqttRequest[Any](**json.loads(msg.payload.decode()))
            print("Parsed MQTT Request:", mqtt_request)
        except Exception as e:
            print("Error while parsing payload:", str(e))
            MqttInvalidDataFormat(client=client, message_id="", topic=response_topic, details=str(e))
            return

        path_handlers = self.registered_routes.get(mqtt_request.method, None)
        if path_handlers is None:
            MqttHandlerNotFoundForMethod(
                client=client,
                topic=response_topic,
                message_id=mqtt_request.msgId,
                method=mqtt_request.method,
            )
            return

        for path, handler in path_handlers.items():
            params, matches = self.match_route(
                requested_path=mqtt_request.path,
                saved_path=path,
            )
            if matches and handler is not None:
                handler(client, userdata, msg, params, mqtt_request)
                return

        MqttHandlerNotFoundForMethodAndPath(
            client=client,
            topic=response_topic,
            message_id=mqtt_request.msgId,
            method=mqtt_request.method,
            path=mqtt_request.path,
        )

    def match_route(
        self, requested_path: Path, saved_path: Path
    ) -> Tuple[Optional[Params], bool]:
        requested_path_segmented = requested_path.split("/")
        saved_path_segmented = saved_path.split("/")

        if len(requested_path_segmented) != len(saved_path_segmented):
            return None, False

        params: Params = dict()
        for idx, segment in enumerate(saved_path_segmented):
            requested_path_segment = requested_path_segmented[idx]
            if segment.startswith(":"):
                params[segment[1:]] = requested_path_segment
            elif segment != requested_path_segment:
                return None, False
        print(f"Params: {params}")
        return params, True
