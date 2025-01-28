use paho_mqtt;
use r2d2::Pool;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;

use crate::app_http::enums;
use crate::app_mqtt::client::MqttResponse;
use crate::app_mqtt::router;
use crate::app_redis::util;
use crate::appointment::schema;

pub struct AppointmentRequestListener {
    router: router::MqttListenerRouter,
    redis_pool: Pool<RedisConnectionManager>,
}

impl AppointmentRequestListener {
    pub fn new(redis_pool: Pool<RedisConnectionManager>) -> Self {
        AppointmentRequestListener {
            router: AppointmentRequestListener::setup_router(),
            redis_pool,
        }
    }

    fn setup_router() -> router::MqttListenerRouter {
        let mut router = router::MqttListenerRouter::new();

        router.register_listener(
            enums::HttpMethod::POST,
            "/appointments".to_string(),
            router::ListenerToken::new_dynamic("CreateAppointment"),
        );
        router.register_listener(
            enums::HttpMethod::DELETE,
            "/appointments/:appointment_id".to_string(),
            router::ListenerToken::new_dynamic("CancelAppointment"),
        );

        router
    }
}

impl router::Router for AppointmentRequestListener {
    fn handle_request(
        &self,
        client: &paho_mqtt::Client,
        receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
    ) {
        if let Some(decoded_request) = self.router.decode_request(client, receiver, message) {
            if decoded_request.token == "CreateAppointment" {
                util::cache_message_id(
                    &self.redis_pool,
                    "appointment_create_new_appointment_message_id_requests",
                    &decoded_request.mqtt_request.msg_id,
                );
            } else if decoded_request.token == "CancelAppointment" {
                let message_id_appointment_id_pair = format!(
                    "{}:{}",
                    &decoded_request.mqtt_request.msg_id,
                    decoded_request
                        .req_params
                        .path_parameters
                        .get("appointment_id")
                        .unwrap_or(&String::new())
                );
                util::cache_message_id(
                    &self.redis_pool,
                    "appointment_cancel_appointment_message_id_requests",
                    &message_id_appointment_id_pair,
                );
            }
        } else {
            eprintln!(
                "Could not decode request for message received on topic '{}'",
                message.topic()
            );
        }
    }
}

pub struct AppointmentResponseListener {
    router: router::MqttListenerRouter,
    redis_pool: Pool<RedisConnectionManager>,
}

impl AppointmentResponseListener {
    pub fn new(redis_pool: Pool<RedisConnectionManager>) -> Self {
        AppointmentResponseListener {
            router: router::MqttListenerRouter::new(),
            redis_pool,
        }
    }

    fn cache_appointment(&self, mqtt_response: &MqttResponse<serde_json::Value>) {
        let mut redis_conn = match self.redis_pool.get() {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!(
                    "Error while getting redis connection from the pool: {}",
                    err
                );
                return;
            }
        };

        let appointment = match serde_json::from_value::<schema::DentistAppointment>(
            mqtt_response.data.clone(),
        ) {
            Ok(new) => new,
            Err(err) => {
                eprintln!("Cannot convert appointment data to an object: {}", err);
                return;
            }
        };

        let json_appointment = match serde_json::to_string(&appointment) {
            Ok(parsed) => parsed,
            Err(err) => {
                println!("Could not parse appointment into json string: {}", err);
                return;
            }
        };

        if let Err(err) = redis_conn
            .rpush::<String, String, ()>("new_dentist_appointments".to_string(), json_appointment)
        {
            eprintln!("Error adding appointment to redis: {}", err);
        }
    }

    fn pop_cancel_appointment_message_id_request(&self, message_id: &str) -> Option<String> {
        let mut redis_conn = match self.redis_pool.get() {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!(
                    "Error while getting redis connection from the pool: {}",
                    err
                );
                return None;
            }
        };

        let cancel_message_ids: Vec<String> =
            match redis_conn.lrange("appointment_cancel_appointment_message_id_requests", 0, -1) {
                Ok(vals) => vals,
                Err(err) => {
                    eprintln!(
                        "Error while getting cancel appointment message IDs from cache: {}",
                        err
                    );
                    return None;
                }
            };

        let message_id_appointment_id_pair = match cancel_message_ids
            .iter()
            .find(|pair| pair.starts_with(message_id))
        {
            Some(pair) => pair,
            None => {
                eprintln!(
                    "No message ID, appointment ID pair found in canceled appointment IDs cache."
                );
                return None;
            }
        };

        let message_id_appointment_id_pair_split: Vec<&str> =
            message_id_appointment_id_pair.split(':').collect();
        if let Ok(removed_count) = redis_conn.lrem::<_, _, isize>(
            "appointment_cancel_appointment_message_id_requests",
            1,
            message_id_appointment_id_pair,
        ) {
            if removed_count > 0 && message_id_appointment_id_pair_split.len() > 1 {
                return Some(message_id_appointment_id_pair_split[1].to_string());
            }
        }

        None
    }

    fn remove_appointment_from_cache(&self, appointment_id: &str) {
        let mut redis_conn = match self.redis_pool.get() {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!(
                    "Error while getting redis connection from the pool: {}",
                    err
                );
                return;
            }
        };

        let cache_key = "new_dentist_appointments".to_string();
        let cached_dentist_appointments: Vec<String> =
            match redis_conn.lrange(cache_key.clone(), 0, -1) {
                Ok(res) => res,
                Err(err) => {
                    eprintln!("Could not get dentist appointments from cache: {}", err);
                    return;
                }
            };

        let mut appointments: Vec<schema::DentistAppointment> = match cached_dentist_appointments
            .into_iter()
            .map(|pref| serde_json::from_str(&pref))
            .collect()
        {
            Ok(parsed) => parsed,
            Err(err) => {
                eprintln!(
                    "Could not convert cached dentist appointments into a list of objects: {}",
                    err
                );
                return;
            }
        };

        appointments.retain(|appointment| appointment.id != appointment_id);

        if let Err(err) = redis_conn.del::<String, ()>(cache_key.clone()) {
            eprintln!("Error clearing redis list: {}", err);
            return;
        }

        for appointment in appointments {
            let serialized_appointment = match serde_json::to_string(&appointment) {
                Ok(serialized) => serialized,
                Err(err) => {
                    eprintln!("Could not serialize appointment to string: {}", err);
                    continue;
                }
            };

            if let Err(err) =
                redis_conn.rpush::<String, String, ()>(cache_key.clone(), serialized_appointment)
            {
                eprintln!("Error adding updated message IDs back to Redis: {}", err);
            }
        }
    }
}

impl router::Router for AppointmentResponseListener {
    fn handle_request(
        &self,
        _client: &paho_mqtt::Client,
        _receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
    ) {
        if let Some(decoded_response) = self.router.decode_response(message) {
            if util::pop_message_id(
                &self.redis_pool,
                "appointment_create_new_appointment_message_id_requests",
                &decoded_response.mqtt_response.msg_id,
            ) {
                self.cache_appointment(&decoded_response.mqtt_response);
                return;
            }

            if let Some(appointment_id) = self
                .pop_cancel_appointment_message_id_request(&decoded_response.mqtt_response.msg_id)
            {
                self.remove_appointment_from_cache(&appointment_id);
            }
        } else {
            eprintln!(
                "Could not decode response for message received on topic: '{}'",
                message.topic()
            );
        }
    }
}
