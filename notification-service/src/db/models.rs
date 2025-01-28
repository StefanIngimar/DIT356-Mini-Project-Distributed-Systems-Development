use diesel::prelude::*;
use serde::Serialize;

use crate::db::schema;

#[derive(Insertable)]
#[diesel(table_name = schema::notification)]
pub struct NewNotification<'a> {
    pub user_id: &'a str,
    pub message: &'a str,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = schema::notification)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Notification {
    pub id: i32,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub user_id: String,
    pub message: String,
    pub was_read: bool,
}

#[derive(Insertable)]
#[diesel(table_name = schema::sent_appointment_notification)]
pub struct NewSentAppointmentNotification<'a> {
    pub appointment_id: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = schema::sent_appointment_notification)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct SentAppointmentNotification {
    pub id: i32,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub appointment_id: String,
}
