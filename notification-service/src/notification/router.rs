use paho_mqtt;

use crate::app_http;
use crate::app_mqtt;
use crate::db::connection::DbPool;
use crate::db::crud;
use crate::db::models;

pub struct NotificationRouter {
    router: app_mqtt::router::MqttRouter,
    db_pool: DbPool,
}

impl NotificationRouter {
    pub fn new(db_pool: DbPool) -> Self {
        NotificationRouter {
            router: NotificationRouter::setup_router(),
            db_pool,
        }
    }

    fn setup_router() -> app_mqtt::router::MqttRouter {
        let mut router = app_mqtt::router::MqttRouter::new();

        router.register_route(
            app_http::enums::HttpMethod::GET,
            "/notifications/:user_id".to_string(),
            app_mqtt::router::ListenerToken::new_dynamic("get-user-notifications"),
        );

        router.register_route(
            app_http::enums::HttpMethod::PUT,
            "/notifications/:notification_id".to_string(),
            app_mqtt::router::ListenerToken::new_dynamic("mark-notification-as-read"),
        );

        router
    }

    fn get_user_notifications(
        &self,
        client: &paho_mqtt::Client,
        _receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
        request_parameters: &app_mqtt::client::RequestParameters,
        mqtt_request: &app_mqtt::client::MqttRequest<serde_json::Value>,
    ) {
        let response_topic = message.topic().replace("/req", "/res");

        let user_id = match request_parameters.path_parameters.get("user_id") {
            Some(id) => id,
            None => {
                app_mqtt::utils::mqtt_publish_err_response(
                    client,
                    &response_topic,
                    &mqtt_request.msg_id,
                    app_mqtt::enums::MqttStatus::Status404NotFound,
                    "User ID not found",
                    "User ID not found in the request path",
                );
                return;
            }
        };

        let mut db_conn = self.db_pool.get().unwrap();

        let status = request_parameters
            .query_parameters
            .get("status")
            .map(String::as_str)
            .unwrap_or("all");

        let fetch_notifications = if status == "unread" {
            crud::get_unread_notifications_for_single_user
        } else {
            crud::get_notifications_for_single_user
        };

        match fetch_notifications(&mut db_conn, user_id.clone()) {
            Ok(notifications) => {
                app_mqtt::utils::mqtt_publish_response::<Vec<models::Notification>>(
                    client,
                    &response_topic,
                    &mqtt_request.msg_id,
                    app_mqtt::enums::MqttStatus::Status200Ok,
                    Some(notifications),
                );
            }
            Err(err) => {
                app_mqtt::utils::mqtt_publish_err_response(
                    client,
                    &response_topic,
                    &mqtt_request.msg_id,
                    app_mqtt::enums::MqttStatus::Status404NotFound,
                    "Could not get user notifications",
                    &err.to_string(),
                );
            }
        };
    }

    fn mark_notification_as_read(
        &self,
        client: &paho_mqtt::Client,
        _receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
        request_parameters: &app_mqtt::client::RequestParameters,
        mqtt_request: &app_mqtt::client::MqttRequest<serde_json::Value>,
    ) {
        let response_topic = message.topic().replace("/req", "/res");

        let notification_id = match request_parameters.path_parameters.get("notification_id") {
            Some(id) => id,
            None => {
                app_mqtt::utils::mqtt_publish_err_response(
                    client,
                    &response_topic,
                    &mqtt_request.msg_id,
                    app_mqtt::enums::MqttStatus::Status404NotFound,
                    "Notification ID not found",
                    "Notification ID not found in the request path",
                );
                return;
            }
        };
        let notification_id_int: i32 = match notification_id.parse::<i32>() {
            Ok(val) => val,
            Err(err) => {
                app_mqtt::utils::mqtt_publish_err_response(
                    client,
                    &response_topic,
                    &mqtt_request.msg_id,
                    app_mqtt::enums::MqttStatus::Status400BadRequest,
                    "Invalid notification ID provided",
                    &err.to_string(),
                );
                return;
            }
        };

        let mut db_conn = self.db_pool.get().unwrap();
        let updated_notification =
            match crud::mark_notification_as_read(&mut db_conn, notification_id_int) {
                Ok(notification) => notification,
                Err(err) => {
                    app_mqtt::utils::mqtt_publish_err_response(
                        client,
                        &response_topic,
                        &mqtt_request.msg_id,
                        app_mqtt::enums::MqttStatus::Status500InternalError,
                        "Could not mark notification as read",
                        &err.to_string(),
                    );
                    return;
                }
            };

        app_mqtt::utils::mqtt_publish_response::<models::Notification>(
            client,
            &response_topic,
            &mqtt_request.msg_id,
            app_mqtt::enums::MqttStatus::Status200Ok,
            Some(updated_notification),
        );
    }
}

impl app_mqtt::router::Router for NotificationRouter {
    fn handle_request(
        &self,
        client: &paho_mqtt::Client,
        receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
        message: &paho_mqtt::Message,
    ) {
        if let Some(decoded_response) = self.router.decode_request(client, receiver, message) {
            if decoded_response.token == "get-user-notifications" {
                eprintln!("Getting user notifications");
                self.get_user_notifications(
                    client,
                    receiver,
                    message,
                    &decoded_response.req_params,
                    &decoded_response.mqtt_request,
                );
            } else if decoded_response.token == "mark-notification-as-read" {
                eprintln!("Marking notification as read");
                self.mark_notification_as_read(
                    client,
                    receiver,
                    message,
                    &decoded_response.req_params,
                    &decoded_response.mqtt_request,
                );
            }
        } else {
            eprintln!(
                "Could not decode response for message received on topic: '{}'",
                message.topic()
            );
        }
    }
}
