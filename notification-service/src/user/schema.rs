use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TimeSlot {
    pub id: String,
    pub start_time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPreference {
    pub id: String,
    pub user_id: String,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub is_active: bool,
    pub days_of_week: Vec<String>,
    pub time_slots: Vec<TimeSlot>,
}
