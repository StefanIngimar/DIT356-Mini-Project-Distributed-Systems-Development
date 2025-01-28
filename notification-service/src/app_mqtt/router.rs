use std::collections::HashMap;

use paho_mqtt;

use crate::app_http::enums;
use crate::app_mqtt;

pub trait Router: Send + Sync {
    fn handle_request(
        &self,
        client: &paho_mqtt::Client,
        receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
    );
}

#[allow(dead_code)]
pub struct DecodedMqttRequest<'a> {
    pub client: &'a paho_mqtt::Client,
    pub receiver: &'a paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
    pub message: &'a paho_mqtt::Message,
    pub req_params: app_mqtt::client::RequestParameters,
    pub mqtt_request: app_mqtt::client::MqttRequest<serde_json::Value>,
    pub token: ListenerToken,
}

pub struct DecodedMqttResponse {
    pub mqtt_response: app_mqtt::client::MqttResponse<serde_json::Value>,
}

#[derive(Clone, Debug)]
pub enum ListenerToken {
    Dynamic(String),
}

impl ListenerToken {
    pub fn new_dynamic(value: &str) -> Self {
        ListenerToken::Dynamic(value.to_string())
    }
}

impl PartialEq<str> for ListenerToken {
    fn eq(&self, other: &str) -> bool {
        match self {
            ListenerToken::Dynamic(dynamic_value) => dynamic_value == other,
        }
    }
}

impl PartialEq<&str> for ListenerToken {
    fn eq(&self, other: &&str) -> bool {
        self.eq(*other)
    }
}

pub struct MqttRouter {
    registered_routes: HashMap<enums::HttpMethod, HashMap<String, ListenerToken>>,
}

impl MqttRouter {
    pub fn new() -> Self {
        MqttRouter {
            registered_routes: HashMap::new(),
        }
    }

    pub fn register_route(
        &mut self,
        method: enums::HttpMethod,
        path: String,
        token: ListenerToken,
    ) {
        let method_routes = self.registered_routes.entry(method).or_default();
        method_routes.insert(path, token);
    }

    pub fn decode_request<'a>(
        &'a self,
        client: &'a paho_mqtt::Client,
        receiver: &'a paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &'a paho_mqtt::Message,
    ) -> Option<DecodedMqttRequest> {
        let mqtt_request = match serde_json::from_slice::<
            app_mqtt::client::MqttRequest<serde_json::Value>,
        >(message.payload())
        {
            Ok(payload) => payload,
            Err(err) => {
                eprintln!("Could not serialize MQTT request: {}", err);
                eprintln!(
                    "Could not serialize the following payload: {:?}",
                    String::from_utf8(message.payload().to_vec()).unwrap()
                );
                return None;
            }
        };

        let path_handlers = match self.registered_routes.get(&mqtt_request.method) {
            Some(handlers) => handlers,
            None => {
                eprintln!(
                    "No message handlers were found for method '{}'",
                    &mqtt_request.method.as_str(),
                );
                return None;
            }
        };

        for (path, token) in path_handlers.iter() {
            match MqttRouter::match_route(&mqtt_request.path, path) {
                Some(req_params) => {
                    return Some(DecodedMqttRequest {
                        client,
                        receiver,
                        message,
                        req_params: req_params.clone(),
                        mqtt_request: mqtt_request.clone(),
                        token: token.clone(),
                    });
                }
                None => continue,
            }
        }

        None
    }

    fn match_route(
        requested_route: &str,
        registered_path: &str,
    ) -> Option<app_mqtt::client::RequestParameters> {
        let normalized_requested_route = requested_route.trim_matches('/');
        let normalized_registered_path = registered_path.trim_matches('/');

        let registered_path_segments: Vec<&str> = normalized_registered_path.split('/').collect();
        let path_and_query: Vec<&str> = normalized_requested_route.splitn(2, '?').collect();

        let requested_path = path_and_query[0];
        let requested_path_segments: Vec<&str> = requested_path.split('/').collect();

        if registered_path_segments.len() != requested_path_segments.len() {
            return None;
        }

        let mut path_params = HashMap::new();
        for (idx, registered_segment) in registered_path_segments.iter().enumerate() {
            let requested_segment = requested_path_segments[idx];

            if let Some(seg) = registered_segment.strip_prefix(':') {
                path_params.insert(seg.to_string(), requested_segment.to_string());
            } else if requested_segment != *registered_segment {
                return None;
            }
        }

        let mut query_params = HashMap::new();
        if path_and_query.len() > 1 {
            let query_string = path_and_query[1];
            for key_value_pair in query_string.split('&') {
                if let Some((key, value)) = key_value_pair.split_once('=') {
                    query_params.insert(key.to_string(), value.to_string());
                }
            }
        }

        let request_params = app_mqtt::client::RequestParameters {
            path_parameters: path_params,
            query_parameters: query_params,
        };

        Some(request_params)
    }
}

pub struct MqttListenerRouter {
    registered_listeners: HashMap<enums::HttpMethod, HashMap<String, ListenerToken>>,
}

impl MqttListenerRouter {
    pub fn new() -> Self {
        MqttListenerRouter {
            registered_listeners: HashMap::new(),
        }
    }

    pub fn register_listener(
        &mut self,
        method: enums::HttpMethod,
        path: String,
        token: ListenerToken,
    ) {
        let method_routes = self.registered_listeners.entry(method).or_default();
        method_routes.insert(path, token);
    }

    pub fn decode_request<'a>(
        &'a self,
        client: &'a paho_mqtt::Client,
        receiver: &'a paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &'a paho_mqtt::Message,
    ) -> Option<DecodedMqttRequest> {
        let mqtt_request = match serde_json::from_slice::<
            app_mqtt::client::MqttRequest<serde_json::Value>,
        >(message.payload())
        {
            Ok(payload) => payload,
            Err(err) => {
                eprintln!("Could not serialize MQTT request: {}", err);
                eprintln!(
                    "Could not serialize the following payload: {:?}",
                    String::from_utf8(message.payload().to_vec()).unwrap()
                );
                return None;
            }
        };

        let path_handlers = match self.registered_listeners.get(&mqtt_request.method) {
            Some(handlers) => handlers,
            None => {
                eprintln!(
                    "No message handlers were found for method '{}'",
                    &mqtt_request.method.as_str(),
                );
                return None;
            }
        };

        for (path, token) in path_handlers.iter() {
            match MqttRouter::match_route(&mqtt_request.path, path) {
                Some(req_params) => {
                    return Some(DecodedMqttRequest {
                        client,
                        receiver,
                        message,
                        req_params: req_params.clone(),
                        mqtt_request: mqtt_request.clone(),
                        token: token.clone(),
                    });
                }
                None => continue,
            }
        }

        None
    }

    pub fn decode_response<'a>(
        &'a self,
        message: &'a paho_mqtt::Message,
    ) -> Option<DecodedMqttResponse> {
        let mqtt_response = match serde_json::from_slice::<
            app_mqtt::client::MqttResponse<serde_json::Value>,
        >(message.payload())
        {
            Ok(payload) => payload,
            Err(err) => {
                eprintln!("Could not serialize MQTT response: {}", err);
                return None;
            }
        };

        Some(DecodedMqttResponse { mqtt_response })
    }
}
