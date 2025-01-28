use serde::{de::Unexpected, Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum MqttStatus {
    Status200Ok = 200,
    Status201Created = 201,
    Status204NoContent = 204,
    Status400BadRequest = 400,
    Status401Unauthorized = 401,
    Status404NotFound = 404,
    Status500InternalError = 500,
}

impl Serialize for MqttStatus {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_u16(*self as u16)
    }
}

impl<'de> Deserialize<'de> for MqttStatus {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let val = u16::deserialize(deserializer)?;
        match val {
            200 => Ok(MqttStatus::Status200Ok),
            201 => Ok(MqttStatus::Status201Created),
            204 => Ok(MqttStatus::Status204NoContent),
            400 => Ok(MqttStatus::Status400BadRequest),
            401 => Ok(MqttStatus::Status401Unauthorized),
            404 => Ok(MqttStatus::Status404NotFound),
            500 => Ok(MqttStatus::Status500InternalError),
            _ => Err(serde::de::Error::invalid_value(
                Unexpected::Unsigned(val as u64),
                &"valid MQTT status code",
            )),
        }
    }
}

#[derive(Clone, Copy)]
pub enum QoS {
    AtMostOnce = 0,
}

impl QoS {
    pub fn as_i32(&self) -> i32 {
        *self as i32
    }
}
