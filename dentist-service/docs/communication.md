# How To Communicate With The Service

## MQTT

### Topics

The service operates on two **request** and two **respond** topics - so four topics in total.

Request topics:

- `dit356g2/dentists/req`
- `dit356g2/clinics/req`

Response topics:

- `dit356g2/dentists/res`
- `dit356g2/clinics/res`

That means that you should publish to the request topic and subscribe to the response topic in order to get the response back.

### Routers & Available Handlers

Eeach of the request topics is tied to a MQTT router. Therefore, there are two routers in the service - one for **dentists** and the other one for **clinics**. The topic that data is published to selects what router is used to handle the internal routing.

The message handler is found by the router by looking at the combination of `method` and `path` fields in the MQTT Request payload.

### Dentist Router

Available methods, paths and their required payload data for the dentist router

| Action                                  | Method | Path                  | Input Data   | Output Data         | Error Codes   | Success Codes |
| --------------------------------------- | ------ | --------------------- | ------------ | ------------------- | ------------- | ------------- |
| Get Dentists                            | GET    | /dentists             | -            | List[DentistOutput] | 500           | 200           |
| Get Dentist                             | GET    | /dentists/:id         | -            | DentistOutput       | 400, 404, 500 | 200           |
| Get Dentist with all associated clinics | GET    | /dentists/:id/clinics | -            | DentistWithClinics  | 400, 404, 500 | 200           |
| Add Dentist                             | POST   | /dentists             | DentistInput | DentistOutput       | 400, 500      | 201           |
| Delete Dentist                          | DELETE | /dentists/:id         | -            | -                   | 400, 404, 500 | 204           |

#### Dentist Schema

**DentistInput**

```json
{
  "first_name": "string: required",
  "last_name": "string: required",
  "specialization": "string: optional",
  "years_of_experiance": "number: optional",
  "contact": {
    "email": "string: optional",
    "phone_number": "string: optional"
  }
}
```

**DentistOutput**

```json
{
  "id": "string: required",
  "first_name": "string: required",
  "last_name": "string: required",
  "specialization": "string: optional",
  "years_of_experiance": "number: optional",
  "contact": {
    "id": "string: required",
    "email": "string: optional",
    "phone_number": "string: optional"
  }
}
```

**DentistWithClinics**

```json
{
  "id": "string: required",
  "first_name": "string: required",
  "last_name": "string: required",
  "specialization": "string: optional",
  "years_of_experiance": "number: optional",
  "contact": {
    "id": "string: required",
    "email": "string: optional",
    "phone_number": "string: optional"
  },
  "clinics": [
    {
      "id": "string: required",
      "name": "string: required",
      "description": "string: optional",
      "address": {
        "id": "string: required",
        "street": "string: required",
        "city": "string: required",
        "postal_code": "string: required",
        "country": "string: required",
        "latitude": "float: optional",
        "longitude": "float: optional"
      },
      "contact": {
        "id": "string: required",
        "email": "string: optional",
        "phone_number": "string: optional"
      }
    }
  ]
}
```

### Clinic Router

Available methods, paths and their required payload data for the clinics router

| Action                  | Method | Path                  | Input Data   | Output Data         | Error Codes   | Success Codes |
| ----------------------- | ------ | --------------------- | ------------ | ------------------- | ------------- | ------------- |
| Get Clinics             | GET    | /clinics              | -            | List[ClinicOutput]  | 500           | 200           |
| Get Clinic              | GET    | /clinics/:id          | -            | DentistOutput       | 400, 404, 500 | 200           |
| Get Dentists For Clinic | GET    | /clinics/:id/dentists | -            | List[DentistOutput] | 400, 500      | 200           |
| Add Clinic              | POST   | /clinics              | ClinicInput  | ClinicOutput        | 400, 500      | 201           |
| Add Dentist To Clinic   | POST   | /clinics/:id/dentists | DentistInput | DentistOutput       | 400, 404, 500 | 201           |
| Delete Clinic           | DELETE | /clinics/:id          | -            | -                   | 404, 500      | 204           |

#### Clinic Schema

**ClinicInput**

```json
{
  "name": "string: required",
  "description": "string: optional",
  "address": {
    "street": "string: required",
    "city": "string: required",
    "postal_code": "string: required",
    "country": "string: required",
    "latitude": "float: optional",
    "longitude": "float: optional"
  },
  "contact": {
    "email": "string: optional",
    "phone_number": "string: optional"
  }
}
```

**ClinicOutput**

```json
{
  "id": "string: required",
  "name": "string: required",
  "description": "string: optional",
  "address": {
    "id": "string: required",
    "street": "string: required",
    "city": "string: required",
    "postal_code": "string: required",
    "country": "string: required",
    "latitude": "float: optional",
    "longitude": "float: optional"
  },
  "contact": {
    "id": "string: required",
    "email": "string: optional",
    "phone_number": "string: optional"
  }
}
```
