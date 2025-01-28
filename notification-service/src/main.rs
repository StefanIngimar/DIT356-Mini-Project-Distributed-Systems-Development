use std::sync::Arc;

mod app_http;
mod app_mqtt;
mod app_redis;
mod app_ws;
mod appointment;
mod config;
mod db;
mod notification;
mod user;

fn main() {
    let app_config = config::app::Config::new();

    let db_conn_pool = db::connection::establish_connection_pool(&app_config.db_url);

    let redis_conn_pool = app_redis::client::create_connection_pool(
        &app_config.redis_hostname,
        &app_config.redis_password,
    );

    let mqtt_conn = app_mqtt::client::MqttConnection::new(
        &app_config.mqtt_broker_uri,
        &app_config.mqtt_client_id,
    );
    let receiver = mqtt_conn.connect_and_run();

    let mqtt_ws_conn = Arc::new(app_mqtt::client::MqttConnection::new(
        &app_config.mqtt_broker_ws_uri,
        &app_config.mqtt_client_ws_id,
    ));
    mqtt_ws_conn.connect();

    let mqtt_ws_conn_clone = Arc::clone(&mqtt_ws_conn);

    let mut notification_service = notification::service::NotificationService::new(
        app_mqtt::enums::QoS::AtMostOnce,
        redis_conn_pool.clone(),
        db_conn_pool.clone(),
    );

    notification_service.setup_service_data(&mqtt_conn.client, &receiver);

    let notification_router = notification::router::NotificationRouter::new(db_conn_pool.clone());
    let user_request_listener = user::router::UserReqListener::new(redis_conn_pool.clone());
    let user_response_listener = user::router::UserResListener::new(redis_conn_pool.clone());
    let appointment_request_listener =
        appointment::router::AppointmentRequestListener::new(redis_conn_pool.clone());
    let appointment_response_listener =
        appointment::router::AppointmentResponseListener::new(redis_conn_pool.clone());

    notification_service.mount_router("dit356g2/notifications/req", Box::new(notification_router));
    notification_service.mount_router("dit356g2/users/req", Box::new(user_request_listener));
    notification_service.mount_router("dit356g2/users/res", Box::new(user_response_listener));
    notification_service.mount_router(
        "dit356g2/appointments/req",
        Box::new(appointment_request_listener),
    );
    notification_service.mount_router(
        "dit356g2/appointments/res",
        Box::new(appointment_response_listener),
    );

    notification_service.subscribe_to_router_topics(&mqtt_conn.client);

    let notification_service_arc = Arc::new(notification::service::NotificationService::new(
        app_mqtt::enums::QoS::AtMostOnce,
        redis_conn_pool.clone(),
        db_conn_pool.clone(),
    ));
    notification_service_arc.start_notification_cron(mqtt_ws_conn_clone);

    for msg in receiver.iter() {
        if let Some(msg) = msg {
            notification_service.dispatch_message(&mqtt_conn.client, &receiver, &msg);
        } else {
            println!("Disconnected from the MQTT broker. Trying to reconnect...");
            match mqtt_conn.client.reconnect() {
                Ok(_) => println!("Reconnected to the MQTT broker"),
                Err(err) => println!("Could not reconnect to the MQTT broker: {}", err),
            }
        }
    }
}
