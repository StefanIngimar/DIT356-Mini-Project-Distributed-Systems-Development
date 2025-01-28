use std::env;

#[derive(Debug)]
pub struct Config {
    pub db_url: String,
    pub mqtt_broker_uri: String,
    pub mqtt_client_id: String,
    pub mqtt_broker_ws_uri: String,
    pub mqtt_client_ws_id: String,
    pub redis_hostname: String,
    pub redis_password: String,
}

impl Config {
    pub fn new() -> Self {
        Config {
            db_url: env::var("DB_URL").unwrap_or_else(|_| "./data/main.db".to_string()),
            mqtt_broker_uri: env::var("MQTT_BROKER_URI")
                .unwrap_or_else(|_| "tcp://localhost:1883".to_string()),
            mqtt_client_id: env::var("MQTT_CLIENT_ID")
                .unwrap_or_else(|_| "notification-service".to_string()),
            mqtt_broker_ws_uri: env::var("MQTT_BROKER_WS_URI")
                .unwrap_or_else(|_| "ws://localhost:9001".to_string()),
            mqtt_client_ws_id: env::var("MQTT_CLIENT_WS_ID")
                .unwrap_or_else(|_| "notification-service-ws".to_string()),
            redis_hostname: env::var("REDIS_HOSTNAME").unwrap_or_else(|_| "localhost".to_string()),
            redis_password: env::var("REDIS_PASSWORD").unwrap_or_else(|_| "".to_string()),
        }
    }
}
