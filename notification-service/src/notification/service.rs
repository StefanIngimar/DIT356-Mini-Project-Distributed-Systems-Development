use std::collections::HashMap;
use std::sync::Arc;
use std::thread;

use paho_mqtt::{self, Message};
use r2d2::Pool;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;

use chrono::NaiveDate;
use cronjob::CronJob;
use tokio::runtime::Runtime;

use crate::app_mqtt;
use crate::app_ws::schema::WsPayload;
use crate::appointment::schema::DentistAppointment;
use crate::db::connection::DbPool;
use crate::db::crud;
use crate::user::{interop, schema::UserPreference, utils};

pub struct NotificationService {
    mounted_routers: HashMap<String, Box<dyn app_mqtt::router::Router>>,
    qos: app_mqtt::enums::QoS,
    redis_pool: Pool<RedisConnectionManager>,
    db_pool: DbPool,
}

impl NotificationService {
    pub fn new(
        qos: app_mqtt::enums::QoS,
        redis_pool: Pool<RedisConnectionManager>,
        db_pool: DbPool,
    ) -> Self {
        NotificationService {
            mounted_routers: HashMap::new(),
            qos,
            redis_pool,
            db_pool,
        }
    }

    pub fn mount_router(&mut self, request_topic: &str, router: Box<dyn app_mqtt::router::Router>) {
        self.mounted_routers
            .insert(request_topic.to_string(), router);
    }

    pub fn subscribe_to_router_topics(&self, client: &paho_mqtt::Client) {
        for (topic, _) in self.mounted_routers.iter() {
            match client.subscribe(topic, self.qos.as_i32()) {
                Ok(_) => (),
                Err(err) => eprintln!("Cannot subscribe to '{}' topic. Error: {}", topic, err),
            };
        }
    }

    pub fn dispatch_message(
        &self,
        client: &paho_mqtt::Client,
        receiver: &paho_mqtt::Receiver<Option<Message>>,
        message: &paho_mqtt::Message,
    ) {
        match self.mounted_routers.get(message.topic()) {
            Some(router) => router.handle_request(client, receiver, message),
            None => eprintln!("Not router found for topic '{}'", message.topic()),
        };
    }

    pub fn setup_service_data(
        &self,
        client: &paho_mqtt::Client,
        receiver: &paho_mqtt::Receiver<Option<Message>>,
    ) {
        let mut redis_conn = self.redis_pool.get().unwrap();

        let user_preferences = match interop::get_user_preferences(client, receiver) {
            Ok(data) => data,
            Err(err) => panic!(
                "Could not get user preferences data during the notification service setup: {}",
                err
            ),
        };
        let aggregated_user_preferences =
            utils::aggregate_user_preferences_by_user_id(user_preferences);

        for (user_id, preferences) in aggregated_user_preferences {
            let json_preferences: Vec<String> = match preferences
                .into_iter()
                .map(|pref| serde_json::to_string(&pref))
                .collect()
            {
                Ok(parsed) => parsed,
                Err(err) => {
                    println!("Could not parse preferences into json string: {}", err);
                    continue;
                }
            };

            let cache_key = format!("user_preferences_{}", user_id);
            if let Err(err) = redis_conn.del::<_, ()>(cache_key.clone()) {
                eprintln!(
                    "Could not remove user preferences value list for user with ID '{}', error: {}",
                    user_id, err
                );
                continue;
            }

            for preference in json_preferences {
                match redis_conn.rpush::<String, String, ()>(cache_key.clone(), preference) {
                    Ok(_) => (),
                    Err(err) => {
                        eprintln!("Could not insert user preference to redis for user with ID '{}', error: {}", user_id, err);
                    }
                }
            }
        }
    }

    fn aggregate_appointments_for_each_user(
        &self,
        appointments: &Vec<DentistAppointment>,
        user_preferences: &Vec<UserPreference>,
    ) -> HashMap<String, Vec<DentistAppointment>> {
        fn get_full_weekday_name(date: &NaiveDate) -> String {
            date.format("%A").to_string().to_lowercase()
        }

        fn is_appointment_date_between_preference_dates(
            appointment: &DentistAppointment,
            preference: &UserPreference,
        ) -> bool {
            appointment.date >= preference.start_date && preference.end_date >= appointment.date
        }

        fn is_appointment_weekday_in_preference_weekdays(
            appointment: &DentistAppointment,
            preference: &UserPreference,
        ) -> bool {
            preference
                .days_of_week
                .contains(&get_full_weekday_name(&appointment.date))
        }

        fn is_appointment_start_time_in_preference_time_slots(
            appointment: &DentistAppointment,
            preference: &UserPreference,
        ) -> bool {
            preference
                .time_slots
                .clone()
                .into_iter()
                .map(|slot| slot.start_time)
                .collect::<Vec<String>>()
                .contains(&appointment.start_time)
        }

        let mut user_notifications: HashMap<String, Vec<DentistAppointment>> = HashMap::new();

        for appointment in appointments {
            for preference in user_preferences {
                if is_appointment_date_between_preference_dates(appointment, preference)
                    && is_appointment_weekday_in_preference_weekdays(appointment, preference)
                    && is_appointment_start_time_in_preference_time_slots(appointment, preference)
                {
                    user_notifications
                        .entry(preference.user_id.clone())
                        .or_default()
                        .push(appointment.clone());
                }
            }
        }

        user_notifications
    }

    fn aggregate_user_appointments_by_date(
        &self,
        user_notifications: &HashMap<String, Vec<DentistAppointment>>,
    ) -> HashMap<String, HashMap<NaiveDate, Vec<String>>> {
        user_notifications
            .iter()
            .map(|(user_id, appointments)| {
                let date_to_time_slots = appointments.iter().fold(
                    HashMap::new(),
                    |mut acc: HashMap<NaiveDate, Vec<String>>, appointment| {
                        acc.entry(appointment.date)
                            .or_default()
                            .push(appointment.start_time.clone());
                        acc
                    },
                );
                (user_id.clone(), date_to_time_slots)
            })
            .collect()
    }

    fn prepare_notification_messages(
        &self,
        aggregated_user_appointments: &HashMap<String, HashMap<NaiveDate, Vec<String>>>,
    ) -> HashMap<String, Vec<String>> {
        aggregated_user_appointments
            .iter()
            .map(|(user_id, date_to_time_slots)| {
                let messages = date_to_time_slots
                    .iter()
                    .map(|(date, time_slots)| {
                        format!(
                            "Appointments available on {} at: {}",
                            date,
                            time_slots.join(", ")
                        )
                    })
                    .collect();

                (user_id.clone(), messages)
            })
            .collect()
    }

    pub fn get_cached_dentist_appointments(&self) -> Vec<DentistAppointment> {
        let mut redis_conn = match self.redis_pool.get() {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!(
                    "Error while getting redis connection from the pool: {}",
                    err
                );
                return vec![];
            }
        };

        let cache_key = "new_dentist_appointments".to_string();
        let cached_dentist_appointments: Vec<String> =
            match redis_conn.lrange(cache_key.clone(), 0, -1) {
                Ok(res) => res,
                Err(err) => {
                    eprintln!("Could not get dentist appointments from cache: {}", err);
                    return vec![];
                }
            };

        let appointments: Vec<DentistAppointment> = match cached_dentist_appointments
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
                return vec![];
            }
        };

        appointments
    }

    pub fn get_cached_user_preferences(&self) -> Vec<UserPreference> {
        let mut redis_conn = match self.redis_pool.get() {
            Ok(conn) => conn,
            Err(err) => {
                eprintln!(
                    "Error while getting redis connection from the pool: {}",
                    err
                );
                return vec![];
            }
        };

        let pattern = "user_preferences*";
        let scan_result = match redis_conn.scan_match::<_, String>(pattern.to_string()) {
            Ok(iter) => iter,
            Err(err) => {
                eprintln!("Error while scanning for user preference keys: {}", err);
                return vec![];
            }
        };
        let keys: Vec<String> = scan_result.collect();

        let mut values: Vec<String> = Vec::new();
        for key in keys {
            match redis_conn.lrange::<_, Vec<String>>(&key, 0, -1) {
                Ok(val) => values.extend_from_slice(&val),
                Err(err) => {
                    eprintln!("Error getting value for key '{}': {}", key, err);
                }
            }
        }

        let user_preferences: Vec<UserPreference> = match values
            .into_iter()
            .map(|value| serde_json::from_str(&value))
            .collect()
        {
            Ok(parsed) => parsed,
            Err(err) => {
                eprintln!(
                    "Error converting cached user preference into an object: {}",
                    err
                );
                return vec![];
            }
        };

        user_preferences
    }

    fn prepare_notifications(&self) -> Result<HashMap<String, Vec<String>>, diesel::result::Error> {
        let appointments_data = self.get_cached_dentist_appointments();
        let user_preferences = self.get_cached_user_preferences();

        let mut db_conn = self.db_pool.get().unwrap();

        let appointment_ids = appointments_data
            .iter()
            .map(|appointment| appointment.id.clone())
            .collect();
        let unsent_appointment_ids =
            match crud::filter_unsent_appointments(&mut db_conn, appointment_ids) {
                Ok(val) => val,
                Err(err) => {
                    return Err(err);
                }
            };

        let _ = crud::create_sent_appointment_notification_in_bulk(
            &mut db_conn,
            unsent_appointment_ids.clone(),
        );

        let unsent_appointments: Vec<DentistAppointment> = appointments_data
            .into_iter()
            .filter(|appointment| unsent_appointment_ids.contains(&appointment.id))
            .collect();

        let user_notifications =
            self.aggregate_appointments_for_each_user(&unsent_appointments, &user_preferences);
        let aggregated_user_appointments =
            self.aggregate_user_appointments_by_date(&user_notifications);

        let notification_messages =
            self.prepare_notification_messages(&aggregated_user_appointments);

        let notification_data: Vec<crud::NotificationData> = notification_messages
            .iter()
            .flat_map(|(user_id, messages)| {
                messages.iter().map(|msg| crud::NotificationData {
                    user_id: user_id.clone(),
                    message: msg.clone(),
                })
            })
            .collect();
        crud::create_notification_in_bulk(&mut db_conn, notification_data)?;

        Ok(notification_messages)
    }

    pub fn start_notification_cron(
        self: Arc<Self>,
        mqtt_ws_conn: Arc<app_mqtt::client::MqttConnection>,
    ) {
        let self_clone = Arc::clone(&self);

        thread::spawn(move || {
            let notify = move |_name: &str| {
                let runtime = Runtime::new().unwrap();
                runtime.block_on(async {
                    let notification_messages = match self_clone.prepare_notifications() {
                        Ok(msgs) => msgs,
                        Err(err) => {
                            eprintln!("Error while preparing notification messages: {}", err);
                            return;
                        }
                    };

                    for (user_id, messages) in notification_messages.iter() {
                        let msg = WsPayload {
                            event: "notification".to_string(),
                            data: messages.clone(),
                        };

                        let topic = format!("dit356g2/notifications/ws/users/{}", user_id);
                        app_mqtt::utils::mqtt_publish_websocket::<WsPayload<Vec<String>>>(
                            &mqtt_ws_conn.client,
                            &topic,
                            Some(msg),
                        );
                    }
                });

                println!("Sent notification messages through CRON job");
            };

            let mut cron = CronJob::new("MqttPublisher", notify);

            cron.seconds("*/30");
            cron.start_job();
        });
    }
}
