from typing import Any, Optional

import pytest

from paho.mqtt.client import Client, MQTTMessage
from paho.mqtt.enums import CallbackAPIVersion

from mqtt.router import MqttRouter, Params
from mqtt.schema import HttpMethod, MqttRequest, MqttStatus
from mqtt.client import MqttClient


@pytest.fixture
def paho_client() -> Client:
    return Client(callback_api_version=CallbackAPIVersion.VERSION2)


def test_match_route_no_params():
    router = MqttRouter()

    assert ({}, True) == router.match_route(requested_path="/", saved_path="/")
    assert ({}, True) == router.match_route(requested_path="/foo", saved_path="/foo")
    assert ({}, True) == router.match_route(
        requested_path="/foo/bar", saved_path="/foo/bar"
    )

    assert (None, False) == router.match_route(requested_path="/foo", saved_path="/")
    assert (None, False) == router.match_route(
        requested_path="/foo/bar", saved_path="/foo/bar/baz"
    )


def test_match_route_params():
    router = MqttRouter()

    assert ({"id": "aabb"}, True) == router.match_route(
        requested_path="/aabb", saved_path="/:id"
    )
    assert ({"id": "aabb"}, True) == router.match_route(
        requested_path="/foo/aabb", saved_path="/foo/:id"
    )
    assert ({"id": "aabb"}, True) == router.match_route(
        requested_path="/foo/bar/aabb", saved_path="/foo/bar/:id"
    )
    assert ({"id": "aabb"}, True) == router.match_route(
        requested_path="/foo/aabb/bar", saved_path="/foo/:id/bar"
    )

    assert (None, False) == router.match_route(
        requested_path="/foo/aabb", saved_path="/foo/:id/bar"
    )
    assert (None, False) == router.match_route(
        requested_path="/foo/bar", saved_path="/foo/bar/:id"
    )


def test_serve_invalid_payload_format(paho_client):
    def send_error_response(
        client: Client,
        origin_topic: str,
        message_id: str,
        status_code: MqttStatus,
        error_msg: str,
        details: str,
    ):
        assert origin_topic == "/topic/res"
        assert message_id == ""
        assert status_code == MqttStatus.STATUS_400_BAD_REQUEST
        assert error_msg == "Invalid data format"

    def handler(
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ):
        # should not be called during the test run
        raise NotImplementedError()

    MqttClient.send_error_response = send_error_response

    router = MqttRouter()

    router.register_route(HttpMethod.GET, "/foo/req", handler)

    message = MQTTMessage()
    message.payload = '{"msgId": "invalid"}'.encode()
    message.topic = "/topic/req".encode()

    router.serve(client=paho_client, userdata={}, msg=message)


def test_serve_handler_not_found_for_method(paho_client):
    def send_error_response(
        client: Client,
        origin_topic: str,
        message_id: str,
        status_code: MqttStatus,
        error_msg: str,
        details: str,
    ):
        assert origin_topic == "/topic/res"
        assert message_id == "aabb"
        assert status_code == MqttStatus.STATUS_404_NOT_FOUND
        assert error_msg == "No handlers found for method 'POST'"
        assert details == "No handlers found for method 'POST'"

    def handler(
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ):
        # should not be called during the test run
        raise NotImplementedError()

    MqttClient.send_error_response = send_error_response

    router = MqttRouter()

    router.register_route(HttpMethod.GET, "/foo/req", handler)

    message = MQTTMessage()
    message.payload = (
        '{"msgId": "aabb", "method": "POST", "path": "/foo/bar", "data": {}}'.encode()
    )
    message.topic = "/topic/req".encode()

    router.serve(client=paho_client, userdata={}, msg=message)


def test_serve_handler_not_found_for_method_and_path(paho_client):
    def send_error_response(
        client: Client,
        origin_topic: str,
        message_id: str,
        status_code: MqttStatus,
        error_msg: str,
        details: str,
    ):
        assert origin_topic == "/topic/res"
        assert message_id == "aabb"
        assert status_code == MqttStatus.STATUS_404_NOT_FOUND
        assert error_msg == "No handler found for method 'GET' and path '/foo/bar'"
        assert details == "No handler found for method 'GET' and path '/foo/bar'"

    def handler(
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ):
        # should not be called during the test run
        raise NotImplementedError()

    MqttClient.send_error_response = send_error_response

    router = MqttRouter()

    router.register_route(HttpMethod.GET, "/foo/req", handler)

    message = MQTTMessage()
    message.payload = (
        '{"msgId": "aabb", "method": "GET", "path": "/foo/bar", "data": {}}'.encode()
    )
    message.topic = "/topic/req".encode()

    router.serve(client=paho_client, userdata={}, msg=message)


def test_serve_handler_calls_correct_handler(paho_client):
    def send_error_response(
        client: Client,
        origin_topic: str,
        message_id: str,
        status_code: MqttStatus,
        error_msg: str,
        details: str,
    ):
        # should not be called during the test run
        raise NotImplementedError()

    def handler(
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ):
        assert params is not None and params.get("id", None) == "1122"
        assert payload.msgId == "aabb"
        assert payload.path == "/foo/1122/bar"
        assert payload.method == HttpMethod.GET
        assert payload.data == {}

    MqttClient.send_error_response = send_error_response

    router = MqttRouter()

    router.register_route(HttpMethod.GET, "/foo/:id/bar", handler)

    message = MQTTMessage()
    message.payload = '{"msgId": "aabb", "method": "GET", "path": "/foo/1122/bar", "data": {}}'.encode()
    message.topic = "/topic/req".encode()

    router.serve(client=paho_client, userdata={}, msg=message)
