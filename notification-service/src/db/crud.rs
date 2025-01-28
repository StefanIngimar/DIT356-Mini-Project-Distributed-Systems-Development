use diesel::prelude::*;

use crate::db::models;
use crate::db::schema;

use diesel::sqlite::SqliteConnection;

pub struct NotificationData {
    pub user_id: String,
    pub message: String,
}

pub fn create_notification_in_bulk(
    conn: &mut SqliteConnection,
    notifications_data: Vec<NotificationData>,
) -> Result<Vec<models::Notification>, diesel::result::Error> {
    use schema::notification::dsl::*;

    let new_notifications: Vec<models::NewNotification> = notifications_data
        .iter()
        .map(|data| models::NewNotification {
            user_id: &data.user_id,
            message: &data.message,
        })
        .collect();

    diesel::insert_into(notification)
        .values(&new_notifications)
        .execute(conn)
        .expect("Error saving sent appointment notifications");

    let user_ids: Vec<String> = notifications_data
        .iter()
        .map(|data| data.user_id.clone())
        .collect();
    let messages: Vec<String> = notifications_data
        .iter()
        .map(|data| data.message.clone())
        .collect();
    let inserted_notifications = notification
        .filter(user_id.eq_any(user_ids))
        .filter(message.eq_any(messages))
        .load::<models::Notification>(conn)?;

    Ok(inserted_notifications)
}

pub fn create_sent_appointment_notification_in_bulk(
    conn: &mut SqliteConnection,
    appointment_ids: Vec<String>,
) -> Vec<models::SentAppointmentNotification> {
    use schema::sent_appointment_notification::dsl::*;

    let new_sent_appointment_notifications: Vec<models::NewSentAppointmentNotification> =
        appointment_ids
            .iter()
            .map(
                |other_appointment_id| models::NewSentAppointmentNotification {
                    appointment_id: other_appointment_id,
                },
            )
            .collect();

    diesel::insert_into(sent_appointment_notification)
        .values(&new_sent_appointment_notifications)
        .execute(conn)
        .expect("Error saving sent appointment notifications");

    sent_appointment_notification
        .filter(appointment_id.eq_any(appointment_ids))
        .load::<models::SentAppointmentNotification>(conn)
        .expect("Error loading inserted records")
}

pub fn filter_unsent_appointments(
    conn: &mut SqliteConnection,
    appointment_ids: Vec<String>,
) -> Result<Vec<String>, diesel::result::Error> {
    use schema::sent_appointment_notification::dsl::*;

    let sent_ids: Vec<String> = sent_appointment_notification
        .filter(appointment_id.eq_any(&appointment_ids))
        .select(appointment_id)
        .load::<String>(conn)?;

    let unsent_ids: Vec<String> = appointment_ids
        .into_iter()
        .filter(|other_id| !sent_ids.contains(other_id))
        .collect();

    Ok(unsent_ids)
}

pub fn get_notifications_for_single_user(
    conn: &mut SqliteConnection,
    target_user_id: String,
) -> Result<Vec<models::Notification>, diesel::result::Error> {
    use schema::notification::dsl::*;

    Ok(notification
        .filter(user_id.eq(target_user_id))
        .load::<models::Notification>(conn)
        .expect("Error loading notifications for a single user"))
}

pub fn get_unread_notifications_for_single_user(
    conn: &mut SqliteConnection,
    target_user_id: String,
) -> Result<Vec<models::Notification>, diesel::result::Error> {
    use schema::notification::dsl::*;

    Ok(notification
        .filter(user_id.eq(target_user_id))
        .filter(was_read.eq(false))
        .load::<models::Notification>(conn)
        .expect("Error loading notifications for a single user"))
}

pub fn mark_notification_as_read(
    conn: &mut SqliteConnection,
    target_notification_id: i32,
) -> Result<models::Notification, diesel::result::Error> {
    use schema::notification::dsl::*;

    diesel::update(notification.filter(id.eq(target_notification_id)))
        .set(was_read.eq(true))
        .execute(conn)?;

    notification
        .filter(id.eq(target_notification_id))
        .first::<models::Notification>(conn)
}
