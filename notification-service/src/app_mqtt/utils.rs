use std::time::Duration;

use paho_mqtt;
use serde::Serialize;
use uuid::Uuid;

use crate::app_http;
use crate::app_http::enums::HttpMethod;
use crate::app_mqtt::{client, enums, errors, utils};

use super::client::MqttRequest;

pub fn mqtt_publish_err_response(
    client: &paho_mqtt::Client,
    topic: &str,
    message_id: &str,
    status_code: enums::MqttStatus,
    error: &str,
    details: &str,
) {
    let err_body = client::ErrorBody {
        message: error.to_string(),
        details: details.to_string(),
    };

    mqtt_publish_response::<client::ErrorBody>(
        client,
        topic,
        message_id,
        status_code,
        Some(err_body),
    );
}

pub fn mqtt_publish_response<T: Serialize>(
    client: &paho_mqtt::Client,
    topic: &str,
    message_id: &str,
    status_code: enums::MqttStatus,
    payload: Option<T>,
) {
    let response = client::MqttResponse {
        msg_id: message_id.to_string(),
        status: status_code,
        data: payload,
    };

    let json_payload = match serde_json::to_string(&response) {
        Ok(res) => res,
        Err(err) => {
            eprintln!("Could not parse response to json: {}", err);
            return;
        }
    };

    let message = paho_mqtt::MessageBuilder::new()
        .topic(topic)
        .payload(json_payload)
        .finalize();

    if let Err(err) = client.publish(message) {
        eprintln!("Failed to publish response message: {}", err);
    };
}

pub fn mqtt_publish_request<T: Serialize>(
    client: &paho_mqtt::Client,
    topic: &str,
    message_id: &str,
    method: HttpMethod,
    path: &str,
    data: Option<T>,
) {
    let request: MqttRequest<Option<T>> = MqttRequest {
        msg_id: message_id.to_string(),
        method,
        path: path.to_string(),
        data: Some(data),
    };

    let json_payload = match serde_json::to_string(&request) {
        Ok(req) => req,
        Err(err) => {
            eprintln!("Could not parse request to json: {}", err);
            return;
        }
    };

    let message = paho_mqtt::MessageBuilder::new()
        .topic(topic)
        .payload(json_payload)
        .finalize();

    if let Err(err) = client.publish(message) {
        eprintln!("Failed to publish request message: {}", err);
    };
}

pub fn mqtt_publish_websocket<T: Serialize>(
    ws_client: &paho_mqtt::Client,
    topic: &str,
    payload: Option<T>,
) {
    let json_payload = match serde_json::to_string(&payload) {
        Ok(val) => val,
        Err(err) => {
            eprintln!("Could not parse websocket payload to string: {}", err);
            return;
        }
    };

    let message = paho_mqtt::MessageBuilder::new()
        .topic(topic)
        .payload(json_payload)
        .finalize();

    if let Err(err) = ws_client.publish(message) {
        eprintln!("Failed to publish request message: {}", err);
    };
}

pub fn intercommunicate<T: Serialize>(
    client: &paho_mqtt::Client,
    receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
    response_topic: &str,
    request_topic: &str,
    method: app_http::enums::HttpMethod,
    path: &str,
    data: T,
) -> Result<client::MqttResponse<serde_json::Value>, errors::AppMqttError> {
    match client.subscribe(response_topic, 0) {
        Ok(_) => (),
        Err(_) => {
            return Err(errors::AppMqttError::PahoMqtt(paho_mqtt::Error::General(
                "Cannot subscribe to response topic '{}'",
            )));
        }
    }

    let message_id = Uuid::new_v4();
    utils::mqtt_publish_request::<T>(
        client,
        request_topic,
        &message_id.to_string(),
        method,
        path,
        Some(data),
    );

    let timeout = Duration::from_secs(10);
    let end_time = std::time::Instant::now() + timeout;

    loop {
        if std::time::Instant::now() > end_time {
            return Err(errors::AppMqttError::Timeout(
                "Timeout waiting for response".to_string(),
            ));
        }

        if let Some(msg) = receiver.recv_timeout(Duration::from_millis(100)).ok() {
            match msg {
                Some(m) => {
                    if m.topic() == response_topic {
                        let mqtt_response = match serde_json::from_slice::<
                            client::MqttResponse<serde_json::Value>,
                        >(m.payload())
                        {
                            Ok(payload) => payload,
                            Err(err) => return Err(errors::AppMqttError::Serde(err)),
                        };

                        if mqtt_response.msg_id == message_id.to_string() {
                            return Ok(mqtt_response);
                        }
                    }
                }
                None => (),
            }
        }
    }
}
