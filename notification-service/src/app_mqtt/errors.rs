use core::fmt;

use paho_mqtt::Error as PahoMqttError;
use serde_json::Error as SerdeError;

#[derive(Debug)]
pub enum AppMqttError {
    PahoMqtt(PahoMqttError),
    Serde(SerdeError),
    Timeout(String),
}

impl From<PahoMqttError> for AppMqttError {
    fn from(err: PahoMqttError) -> Self {
        return AppMqttError::PahoMqtt(err);
    }
}

impl From<SerdeError> for AppMqttError {
    fn from(err: SerdeError) -> Self {
        return AppMqttError::Serde(err);
    }
}

impl fmt::Display for AppMqttError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppMqttError::PahoMqtt(e) => write!(f, "MQTT Error: {}", e),
            AppMqttError::Serde(e) => write!(f, "Serialization Error: {}", e),
            AppMqttError::Timeout(msg) => write!(f, "Timeout: {}", msg),
        }
    }
}
