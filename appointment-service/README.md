# Deprecated
**This service was deprecated and is/will be merged with the Booking service**


# Appointment Service


## Topics

Request topic:
- _dit356g2/appointments/req_

- _dit356g2/appointments/req_

## Appointments router

| Method | Path | Error codes |Success codes|
|----------|----------|----------|----------|
| GET   | /appointments:id   | 400, 404, 500   |  200     |
| POST   | /appointments   | 400, 404, 500   |  201    |

## Schema

- POST
**Input**
```json
{
    "dentist_id": "String required",
    "clinic_id": "String required",
    "day_of_week": "String required",
    "start_time": "String required",
    "end_time": "String required",
    "status": "String required"

}
```
**Output**
```json
{
    "msgId":"String",
    "status":"Int",
    "id":"String",
    "day_of_week":"String",
    "start_time":"String",
    "end_time":"String",
    "status":"String",
    "dentist":{
        "id": "String",
        "first_name": "String",
        "last_name": "String",
        "specialization": "String",
        "years_of_experience": "Number",
        "contact":{
            "id": "String",
            "email": "String",
            "phone_number": "String"
        },
        }
    "clinic"{
        "id": "String",
        "name": "String",
        "description": "String",
        "address": {
            "id": "String",
            "street": "String",
            "city": "String",
            "postal_code": "String",
            "country": "String",
            "latitude": "Float",
            "longitude": "Float"
        },
        "contact":{
            "id": "String",
            "email": "String",
            "phone_number": "String"
        }
    },
}
```