use paho_mqtt;

use crate::app_http;
use crate::app_mqtt;
use crate::user::schema;

const USER_RESPONSE_TOPIC: &str = "dit356g2/users/res";
const USER_REQUEST_TOPIC: &str = "dit356g2/users/req";

pub fn get_user_preferences(
    client: &paho_mqtt::Client,
    receiver: &paho_mqtt::Receiver<Option<paho_mqtt::Message>>,
) -> Result<Vec<schema::UserPreference>, app_mqtt::errors::AppMqttError> {
    let user_preferences_response = match app_mqtt::utils::intercommunicate::<Option<()>>(
        client,
        receiver,
        USER_RESPONSE_TOPIC,
        USER_REQUEST_TOPIC,
        app_http::enums::HttpMethod::GET,
        "/users/preferences",
        None,
    ) {
        Ok(response) => response,
        Err(err) => return Err(err),
    };

    match serde_json::from_value::<Vec<schema::UserPreference>>(user_preferences_response.data) {
        Ok(user_preferences) => Ok(user_preferences),
        Err(err) => Err(app_mqtt::errors::AppMqttError::Serde(err)),
    }
}
