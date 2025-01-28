use paho_mqtt;
use r2d2::Pool;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;

use crate::app_http::enums;
use crate::app_mqtt::client::MqttResponse;
use crate::app_mqtt::enums as mqtt_enums;
use crate::app_mqtt::router;
use crate::app_redis::util;

use super::schema::{self, UserPreference};

pub struct UserReqListener {
    router: router::MqttListenerRouter,
    redis_pool: Pool<RedisConnectionManager>,
}

impl UserReqListener {
    pub fn new(redis_pool: Pool<RedisConnectionManager>) -> Self {
        UserReqListener {
            router: UserReqListener::setup_router(),
            redis_pool,
        }
    }

    fn setup_router() -> router::MqttListenerRouter {
        let mut router = router::MqttListenerRouter::new();

        router.register_listener(
            enums::HttpMethod::POST,
            "/users/:user_id/preferences".to_string(),
            router::ListenerToken::new_dynamic("CreateUserPreference"),
        );
        router.register_listener(
            enums::HttpMethod::DELETE,
            "/users/:user_id/preferences/:preference_id".to_string(),
            router::ListenerToken::new_dynamic("DeleteUserPreference"),
        );

        router
    }
}

impl router::Router for UserReqListener {
    fn handle_request(
        &self,
        client: &paho_mqtt::Client,
        receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
    ) {
        if let Some(decoded_request) = self.router.decode_request(client, receiver, message) {
            if decoded_request.token == "CreateUserPreference" {
                util::cache_message_id(
                    &self.redis_pool,
                    "user_preference_create_message_id_requests",
                    &decoded_request.mqtt_request.msg_id,
                );
            } else if decoded_request.token == "DeleteUserPreference" {
                util::cache_message_id(
                    &self.redis_pool,
                    "user_preference_delete_message_id_requests",
                    &format!(
                        "{}:{}:{}",
                        &decoded_request.mqtt_request.msg_id,
                        decoded_request
                            .req_params
                            .path_parameters
                            .get("user_id")
                            .unwrap_or(&String::new()),
                        decoded_request
                            .req_params
                            .path_parameters
                            .get("preference_id")
                            .unwrap_or(&String::new())
                    ),
                );
            } else {
                eprintln!("Unknown token value received: {:?}", decoded_request.token);
            }
        } else {
            eprintln!(
                "Could not decode request for message received on topic '{}'",
                message.topic()
            );
        }
    }
}

pub struct UserResListener {
    router: router::MqttListenerRouter,
    redis_pool: Pool<RedisConnectionManager>,
}

impl UserResListener {
    pub fn new(redis_pool: Pool<RedisConnectionManager>) -> Self {
        UserResListener {
            router: router::MqttListenerRouter::new(),
            redis_pool,
        }
    }

    fn find_create_message_id_request(&self, message_id: &str) -> Option<String> {
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

        let cache_key = "user_preference_create_message_id_requests";
        if let Ok(removed_count) = redis_conn.lrem::<_, _, isize>(cache_key, 1, message_id) {
            if removed_count > 0 {
                return Some(message_id.to_string());
            }
        };

        None
    }

    fn find_delete_message_id_request(&self, message_id: &str) -> Option<(String, String)> {
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

        let delete_message_ids: Vec<String> =
            match redis_conn.lrange("user_preference_delete_message_id_requests", 0, -1) {
                Ok(vals) => vals,
                Err(err) => {
                    eprintln!("Error while getting delete message IDs from cache: {}", err);
                    return None;
                }
            };

        let message_id_user_id_preference_id_key = match delete_message_ids
            .iter()
            .find(|pair| pair.starts_with(message_id))
        {
            Some(pair) => pair,
            None => {
                eprintln!("No message ID, preference ID pair found in delete message ID cache.");
                return None;
            }
        };

        let message_id_user_id_preference_id_split: Vec<&str> =
            message_id_user_id_preference_id_key.split(':').collect();
        if let Ok(removed_count) = redis_conn.lrem::<_, _, isize>(
            "user_preference_delete_message_id_requests",
            1,
            message_id_user_id_preference_id_key,
        ) {
            if removed_count > 0 && message_id_user_id_preference_id_split.len() > 2 {
                return Some((
                    message_id_user_id_preference_id_split[1].to_string(),
                    message_id_user_id_preference_id_split[2].to_string(),
                ));
            }
        };

        None
    }

    fn add_user_preference_to_cache(&self, mqtt_response: &MqttResponse<serde_json::Value>) {
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

        let user_preference =
            match serde_json::from_value::<schema::UserPreference>(mqtt_response.data.clone()) {
                Ok(new) => new,
                Err(err) => {
                    eprintln!("Cannot convert user preference data to an object: {}", err);
                    return;
                }
            };

        let json_preference = match serde_json::to_string(&user_preference) {
            Ok(parsed) => parsed,
            Err(err) => {
                println!(
                    "Could not parse new user preference into json string: {}",
                    err
                );
                return;
            }
        };

        let cache_key = format!("user_preferences_{}", user_preference.user_id);
        if let Err(err) = redis_conn.rpush::<String, String, ()>(cache_key, json_preference) {
            eprintln!("Error adding new user preference to redis: {}", err);
        }
    }

    fn remove_user_preference_from_cache(&self, user_id: &str, preference_id: &str) {
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

        let user_preferences_cache_key = format!("user_preferences_{}", user_id);
        let cached_user_preference: Vec<String> =
            match redis_conn.lrange(user_preferences_cache_key.clone(), 0, -1) {
                Ok(user_preferences) => user_preferences,
                Err(err) => {
                    eprintln!(
                        "could not get user preferences for user with ID '{}', error: {}",
                        user_id, err
                    );
                    return;
                }
            };

        let mut user_preferences: Vec<UserPreference> = match cached_user_preference
            .into_iter()
            .map(|pref| serde_json::from_str(&pref))
            .collect()
        {
            Ok(parsed) => parsed,
            Err(err) => {
                eprintln!(
                    "Could not convert cached user preferences into a list of objects: {}",
                    err
                );
                return;
            }
        };

        user_preferences.retain(|pref| pref.id != preference_id);

        if let Err(err) = redis_conn.del::<String, ()>(user_preferences_cache_key.clone()) {
            eprintln!("Error clearing redis list: {}", err);
            return;
        }

        for user_preference in user_preferences {
            let serialized_user_preference = match serde_json::to_string(&user_preference) {
                Ok(serialized) => serialized,
                Err(err) => {
                    eprintln!("Could not serialize user preference to string: {}", err);
                    continue;
                }
            };

            if let Err(err) = redis_conn.rpush::<String, String, ()>(
                user_preferences_cache_key.clone(),
                serialized_user_preference,
            ) {
                eprintln!("Error adding updated message IDs back to Redis: {}", err);
            }
        }
    }
}

impl router::Router for UserResListener {
    fn handle_request(
        &self,
        _client: &paho_mqtt::Client,
        _receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
    ) {
        if let Some(decoded_response) = self.router.decode_response(message) {
            if self
                .find_create_message_id_request(&decoded_response.mqtt_response.msg_id)
                .is_some()
            {
                if decoded_response.mqtt_response.status == mqtt_enums::MqttStatus::Status201Created
                {
                    self.add_user_preference_to_cache(&decoded_response.mqtt_response);
                }
                return;
            }

            if let Some((user_id, preference_id)) =
                self.find_delete_message_id_request(&decoded_response.mqtt_response.msg_id)
            {
                if decoded_response.mqtt_response.status
                    == mqtt_enums::MqttStatus::Status204NoContent
                {
                    self.remove_user_preference_from_cache(&user_id, &preference_id);
                }
            }
        } else {
            eprintln!(
                "Could not decode response for message received on topic '{}'",
                message.topic()
            );
        }
    }
}
