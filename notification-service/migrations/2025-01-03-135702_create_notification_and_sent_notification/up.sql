-- Your SQL goes here
CREATE TABLE notification (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    user_id  TEXT NOT NULL,
    message  TEXT NOT NULL,
    was_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_user_id ON notification(user_id);

CREATE TABLE sent_appointment_notification (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    appointment_id TEXT NOT NULL
);

