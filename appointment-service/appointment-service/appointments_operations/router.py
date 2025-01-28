from typing import Any, Optional
from sqlalchemy.orm import Session
from paho.mqtt.client import Client, MQTTMessage
from config.app import AppConfig
from db.db import Database
from mqtt.router import MqttRouter, Params
from mqtt.schema import HttpMethod, MqttRequest, MqttStatus
from mqtt.client import MqttClient
from appointments_operations.model import Availability#, Clinic
from mqtt.exceptions import MqttInvalidDataFormat, MqttDatabaseRecordAlreadyExist, MqttDatabaseRecordNotFound, MqttDatabaseUnexpectedError, MqttUnauthorized
from db.dataclasses import Result, Error, Response, DbErrorType

class AppointmentsMqttRouter:
    def __init__(self, app_config: AppConfig, database: Database) -> None:
        self.app_config = app_config
        self.database = database
        self.router: MqttRouter = self._register_routes()

        self.clinic_cache= {}

    def _register_routes(self) -> MqttRouter:
        router = MqttRouter()
        router.register_route(HttpMethod.GET, "/appointments/:id", self.get_appointments)
        router.register_route(HttpMethod.POST, "/appointments", self.register_appointment)
        return router

    def serve(self, client, userdata, msg) -> None:
        self.router.serve(client=client, userdata=userdata, msg=msg)

    def get_appointments(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[dict],
    ) -> None:
        try:
            print(f"Raw params: {params}")
            appointment_id = params.get("id") or payload.data.get("appointmentId")
            if not appointment_id:
                raise ValueError("Missing required field: id")
            print(f"Appointment ID: {appointment_id}")
            print(f"Payload data: {payload.data}")

            with Session(self.database.engine) as session:
                result = Availability.get_appointment(session=session, appointment_id=appointment_id)

            if result.is_err():
                err = result.unwrap_error()
                MqttDatabaseRecordNotFound(
                    client=client,
                    origin_topic=msg.topic,
                    message_id=payload.msgId,
                    error_msg="Appointment not found",
                    details=err,
                )
                return

            appointment = result.unwrap()
            appointment_data = appointment.to_schema()

            clinic_id = appointment_data.get("clinic_id")
            dentist_id = appointment_data.get("dentist_id")
            appointment_data["clinic"] = {"id": clinic_id}
            appointment_data["dentist"] = {"id": dentist_id}

            MqttClient.send_response(
                client=client,
                origin_topic=msg.topic,
                message_id=payload.msgId,
                status_code=MqttStatus.STATUS_200_OK,
                payload=appointment_data,
            )

        except Exception as e:
            MqttDatabaseUnexpectedError(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Unexpected error occurred",
                details=str(e),
            )

    def register_appointment(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[dict],
    ) -> None:
        try:
            required_fields = ["dentist_id", "day_of_week", "start_time", "end_time", "status", "clinic_id"]
            for field in required_fields:
                    if field not in payload.data:
                        raise ValueError(f"Missing required field: {field}")



            clinic_id = payload.data.get("clinic_id")
            print(f"Clinic ID received: {clinic_id} ({type(clinic_id)})")
            if not clinic_id or not isinstance(clinic_id, str):
                raise ValueError("Invalid or missing 'clinic_id' field")
            
            dentist_id = payload.data.get("dentist_id")
            print(f"Dentist ID received: {dentist_id} ({type(dentist_id)})")
            if not dentist_id or not isinstance(dentist_id, str):
                raise ValueError("Invalid or missing 'dentist_id' field")
            
            availability_data = {
                "id": payload.data.get("id"),
                "dentist_id": dentist_id,
                "clinic_id": clinic_id,
                "day_of_week": payload.data.get("day_of_week"),
                "start_time": payload.data.get("start_time"),
                "end_time": payload.data.get("end_time"),
                "status": payload.data.get("status"),
            }
        except Exception as e:
            MqttInvalidDataFormat(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                details=str(e),
            )
            return

        with Session(self.database.engine) as session:

            result = Availability.add_appointment(session=session, appointment=Availability(**availability_data))

            if result.is_err():
                err = result.unwrap_error()
                MqttDatabaseRecordAlreadyExist(
                    client=client,
                    topic=msg.topic,
                    message_id=payload.msgId,
                    error_msg="Database record already exists",
                    details="An appointment already exists for the given data",
                    
                )
                return
            #self.clinic_cache[availability_data["id"]] = clinic_data
            appointment = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_201_CREATED,
            payload=appointment.to_schema(),
        )

    def delete_appointment(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        with Session(self.database.engine) as session:
            result = Availability.delete_appointment(session=session, appointment_id=params["id"])

            if result.is_err():
                err = result.unwrap_error()
                MqttDatabaseRecordNotFound(
                    client=client,
                    origin_topic=msg.topic,
                    error_msg=result,
                    details=err,
                )
                return

            MqttClient.send_response(
                client=client,
                origin_topic=msg.topic,
                message_id=payload.msgId,
                status_code=MqttStatus.STATUS_200_OK,
                payload={"message": "Appointment deleted successfully"},
            )

    def change_appointment_status(
            self,
            client: Client,
            userdata: Any,
            msg: MQTTMessage,
            params: Optional[Params],
            payload: MqttRequest[dict],
    ) -> None:
        with Session(self.database.engine) as session:
            result = Availability.change_appointment_status(session=session, appointment_id=params["id"], new_status=payload.data["status"])

            if result.is_err():
                err = result.unwrap_err()
                MqttDatabaseRecordNotFound(
                    client=client,
                    origin_topic=msg.topic,
                    message_id=payload.msgId,
                    error_msg=result,
                    details=err,
                )
                return

            MqttClient.send_response(
                client=client,
                origin_topic=msg.topic,
                message_id=payload.msgId,
                status_code=MqttStatus.STATUS_200_OK,
                payload={"message": "Appointment status changed successfully"},
            )