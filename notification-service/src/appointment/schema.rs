use chrono::NaiveDate;
use serde::de::{self};
use serde::{Deserialize, Deserializer, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DentistAppointment {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    #[serde(rename = "dentistId")]
    pub dentist_id: String,
    #[serde(rename = "clinicId")]
    pub clinic_id: String,
    #[serde(deserialize_with = "deserialize_date")]
    pub date: NaiveDate,
    pub start_time: String,
    pub end_time: String,
    pub status: String,
}

fn deserialize_date<'de, D>(deserializer: D) -> Result<NaiveDate, D::Error>
where
    D: Deserializer<'de>,
{
    let date_str: String = String::deserialize(deserializer)?;
    NaiveDate::parse_from_str(&date_str[0..10], "%Y-%m-%d").map_err(de::Error::custom)
}
