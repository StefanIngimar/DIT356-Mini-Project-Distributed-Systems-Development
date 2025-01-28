# How To Communicate With The Service

## MQTT

### Topics

The service operates on a single **request** and **response** topic.

Request topic:

- `dit356g2/users/req`

Response topic:

- `dit356g2/users/res`

This means that data should be publised on the request topic and the response topic should be subscribed to and listen for the answer based on the processed request.

### User Router

| Action                           | Method | Path                                                  | Input Data           | Output Data          | Error Codes   | Success Codes |
| -------------------------------- | ------ | ----------------------------------------------------- | -------------------- | -------------------- | ------------- | ------------- |
| Get Users                        | GET    | /users                                                | -                    | List[UserOutput]     | 500           | 200           |
| Get User                         | GET    | /users/:id                                            | -                    | UserOutput           | 400, 404, 500 | 200           |
| Get User Preferences             | GET    | /users/:id/preferences                                | -                    | UserPreferenceOutput | 500           | 200           |
| Login                            | POST   | /login                                                | UserLogin            | JwtToken             | 400, 401, 404 | 200           |
| Register New User                | POST   | /users                                                | UserInput            | UserOutput           | 400           | 201           |
| Validate JWT Token               | POST   | /users/:id/jwt                                        | JwtToken             | ValidJwtResponse     | 400           | 200           |
| Add User Preference              | POST   | /users/:id/preferences                                | UserPreferenceInput  | UserPreferenceOuput  | 400, 500      | 201           |
| Add Time Slot To User Preference | POST   | /users/:user_id/preferences/:preference_id/time-slots | TimeSlotInput        | TimeSlotOutput       | 400, 404, 500 | 201           |
| Update User Preference           | PATCH  | /users/:user_id/preferences                           | UpdateUserPreference | UserPreferenceOutput | 400, 404, 500 | 200           |
| Remove User Preference           | DELETE | /users/:user_id/preferences                           | -                    | -                    | 400, 404, 500 | 204           |

#### User Schema

**UserLogin**

```json
{
  "email": "string: required",
  "password": "string: required"
}
```

**UserInput**

```json
{
  "first_name": "string: required",
  "last_name": "string: required",
  "email": "string: required",
  "role": "string: required",
  "password": "string: required"
}
```

**UserOutput**

```json
{
  "id": "string: required",
  "first_name": "string: required",
  "last_name": "string: required",
  "email": "string: required",
  "role": "string: required"
}
```

**UserPreferenceInput**

```json
{
  "start_date": "date: required",
  "end_date": "date: required",
  "is_active": "bool: required",
  "days_of_week": "array[DayOfWeek]: required",
  "time_slots": "array[TimeSlotInput]: required"
}
```

**UserPreferenceOutput**

```json
{
  "id": "string: required",
  "start_date": "date: required",
  "end_date": "date: required",
  "is_active": "bool: required",
  "days_of_week": "array[DayOfWeek]: required",
  "time_slots": "array[TimeSlotOutput]: required"
}
```

**UserPreferenceUpdate**

```json
{
  "start_date": "date: optional",
  "end_date": "date: optional",
  "is_active": "bool: optional",
  "days_of_week": "array[DayOfWeek]: optional",
}
```

**TimeSlotInput**

```json
{
  "start_time": "string: required" // like: 8:00
}
```

**TimeSlotOutput**

```json
{
  "id": "string: required",
  "start_time": "string: required" // like: 8:00
}
```

**DayOfWeek - Enum**

```py
class DayOfWeek(StrEnum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"
```

**JwtToken**

```json
{
  "token": "string: required"
}
```

**ValidJwtResponse**

```json
{
  "is_valid": "boolean: required",
  "reason": "string: required" // On success will be just an empty string
}
```
