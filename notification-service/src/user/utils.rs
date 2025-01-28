use std::collections::HashMap;

use crate::user::schema;

type UserId = String;
pub fn aggregate_user_preferences_by_user_id(
    user_preferences: Vec<schema::UserPreference>,
) -> HashMap<UserId, Vec<schema::UserPreference>> {
    let mut user_id_to_user_preferences_map = HashMap::new();

    user_preferences.into_iter().for_each(|user_preference| {
        let user_id = user_preference.user_id.clone();

        user_id_to_user_preferences_map
            .entry(user_id)
            .or_insert_with(Vec::new)
            .push(user_preference);
    });

    user_id_to_user_preferences_map
}
