use std::collections::HashMap;
use std::time::Duration;

use paho_mqtt;
use serde;
use serde::{Deserialize, Serialize};

use crate::app_http;
use crate::app_mqtt::enums;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MqttRequest<T> {
    #[serde(rename = "msgId")]
    pub msg_id: String,
    pub method: app_http::enums::HttpMethod,
    pub path: String,
    pub data: Option<T>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MqttResponse<T: Serialize> {
    #[serde(rename = "msgId")]
    pub msg_id: String,
    pub status: enums::MqttStatus,
    pub data: T,
}

#[derive(Clone)]
pub struct RequestParameters {
    pub path_parameters: HashMap<String, String>,
    pub query_parameters: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorBody {
    pub message: String,
    pub details: String,
}

pub struct MqttConnection {
    pub client: paho_mqtt::Client,
    connect_options: paho_mqtt::ConnectOptions,
    mqtt_broker_uri: String,
}

impl MqttConnection {
    pub fn new(mqtt_broker_uri: &str, mqtt_client_id: &str) -> Self {
        let client_opts = paho_mqtt::CreateOptionsBuilder::new()
            .server_uri(mqtt_broker_uri)
            .client_id(mqtt_client_id)
            .finalize();

        let client = match paho_mqtt::Client::new(client_opts) {
            Ok(client) => client,
            Err(err) => panic!("Cannot create MQTT client: {}", err),
        };

        let connect_options = paho_mqtt::ConnectOptionsBuilder::new()
            .keep_alive_interval(Duration::from_secs(10))
            .finalize();

        MqttConnection {
            client,
            connect_options,
            mqtt_broker_uri: mqtt_broker_uri.to_string(),
        }
    }

    pub fn connect(&self) {
        if let Err(err) = self.client.connect(self.connect_options.clone()) {
            panic!("Cannot connect to the MQTT broker: {}", err);
        } else {
            let info = format!("Connected to the MQTT broker at '{}'", self.mqtt_broker_uri);
            println!("{}", info);
        }
    }

    pub fn connect_and_run(&self) -> paho_mqtt::Receiver<Option<paho_mqtt::Message>> {
        self.connect();
        self.client.start_consuming()
    }
}
