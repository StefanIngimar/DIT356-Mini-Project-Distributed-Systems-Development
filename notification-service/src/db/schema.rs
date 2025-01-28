// @generated automatically by Diesel CLI.

diesel::table! {
    notification (id) {
        id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        user_id -> Text,
        message -> Text,
        was_read -> Bool,
    }
}

diesel::table! {
    sent_appointment_notification (id) {
        id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        appointment_id -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(notification, sent_appointment_notification,);
