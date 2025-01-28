import time
from typing import Any, Optional

from sqlalchemy.orm import Session
from paho.mqtt.client import Client, MQTTMessage

from config.app import AppConfig

from core.utils import handle_db_error

from db.sqlite import Sqlite

from mqtt.client import MqttClient
from mqtt.router import MqttRouter, Params
from mqtt.schema import HttpMethod, MqttRequest, MqttStatus
from mqtt.exceptions import (
    MqttInvalidDataFormat,
    MqttParametersNotFound,
    MqttUnauthorized,
)

from user.model import PreferredTimeSlot, User, UserPreference
from user.schema import (
    TimeSlotInput,
    UserInput,
    UserLogin,
    UserPreferenceInput,
    UserPreferenceUpdate,
)

from auth.jwt import generate_jwt, is_jwt_valid
from auth.schema import JwtToken, JwtValidationResult


class UserMqttRouter:
    def __init__(self, app_config: AppConfig, database: Sqlite) -> None:
        self.app_config = app_config
        self.database = database
        self.router: MqttRouter = self._register_routes()

    def _register_routes(self) -> MqttRouter:
        router = MqttRouter()

        router.register_route(HttpMethod.GET, "/users", self.get_users)
        router.register_route(
            HttpMethod.GET, "/users/preferences", self.get_users_preferences
        )
        router.register_route(HttpMethod.GET, "/users/:id", self.get_user_by_id)
        router.register_route(
            HttpMethod.GET, "/users/:id/preferences", self.get_single_user_preferences
        )

        router.register_route(HttpMethod.POST, "/login", self.login)
        router.register_route(HttpMethod.POST, "/users", self.register_user)
        router.register_route(
            HttpMethod.POST, "/users/:id/jwt", self.validate_jwt_token
        )
        router.register_route(
            HttpMethod.POST, "/users/:id/preferences", self.add_user_preference
        )
        router.register_route(
            HttpMethod.POST,
            "/users/:user_id/preferences/:preference_id/time-slots",
            self.add_time_slot_to_user_preference,
        )

        router.register_route(
            HttpMethod.PATCH,
            "/users/:user_id/preferences/:preference_id",
            self.update_user_preference,
        )

        router.register_route(
            HttpMethod.DELETE,
            "/users/:user_id/preferences/:preference_id",
            self.remove_user_preference,
        )

        return router

    def serve(self, client, userdata, msg) -> None:
        self.router.serve(client=client, userdata=userdata, msg=msg)

    def get_users(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        with Session(self.database.engine) as session:
            result = User.get_users(session=session)

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            users = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=[user.to_schema() for user in users],
        )

    def get_user_by_id(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        if params is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Request parameters not found",
                details="Request parameters not found",
            )
            return

        user_id = params.get("id", None)
        if user_id is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="User ID not found in the request parameters",
                details="User ID not found in the request parameters",
            )
            return

        with Session(self.database.engine) as session:
            result = User.get_user_by_id(session=session, id=user_id)

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=user.to_schema(),
        )

    def get_users_preferences(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ):
        with Session(self.database.engine) as session:
            result = UserPreference.get_users_preferences(
                session=session
            )

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user_preferences = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=[
                user_preference.to_schema() for user_preference in user_preferences
            ],
        )

    def get_single_user_preferences(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ):
        if params is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Request parameters not found",
                details="Request parameters not found",
            )
            return

        user_id = params.get("id", None)
        if user_id is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="User ID not found in the request parameters",
                details="User ID not found in the request parameters",
            )
            return

        with Session(self.database.engine) as session:
            result = UserPreference.get_user_preferences(
                session=session, user_id=user_id
            )

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user_preferences = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=[
                user_preference.to_schema() for user_preference in user_preferences
            ],
        )

    def register_user(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        try:
            user_data = UserInput(**payload.data)
        except Exception as e:
            MqttInvalidDataFormat(
                client=client, topic=msg.topic, details=str(e), message_id=payload.msgId
            )
            return

        with Session(self.database.engine) as session:
            result = User.add_user(session=session, user=user_data)

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_201_CREATED,
            payload=user.to_schema(),
        )

    def login(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        try:
            login_data = UserLogin(**payload.data)
        except Exception as e:
            MqttInvalidDataFormat(
                client=client, topic=msg.topic, details=str(e), message_id=payload.msgId
            )
            return

        with Session(self.database.engine) as session:
            user_result = User.get_user_by_email(
                session=session, email=login_data.email
            )
            if user_result.is_err():
                err = user_result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user = user_result.unwrap()
            user_role = user.role

        if not user.is_correct_password(plain_password=login_data.password):
            MqttUnauthorized(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
            )
            return

        jwt_token = generate_jwt(
            payload={
                "sub": str(user.id),
                "full_name": f"{user.first_name} {user.last_name}",
                "email": str(user.email),
                "role": str(user_role.role),
                "iat": int(time.time()),
                "exp": int(time.time()) + self.app_config.JWT_EXP_TIME,
            },
            secret=self.app_config.JWT_SECRET,
            algorithm=self.app_config.JWT_ALGORITHM,
        )

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=JwtToken(token=jwt_token),
        )

    def validate_jwt_token(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        try:
            token_data = JwtToken(**payload.data)
        except Exception as e:
            MqttInvalidDataFormat(
                client=client, topic=msg.topic, details=str(e), message_id=payload.msgId
            )
            return

        is_valid, reason = is_jwt_valid(
            token=token_data.token,
            secret=self.app_config.JWT_SECRET,
            algorithm=self.app_config.JWT_ALGORITHM,
        )

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=JwtValidationResult(
                is_valid=is_valid,
                reason=reason,
            ),
        )

    def add_user_preference(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        try:
            user_preference = UserPreferenceInput(**payload.data)
        except Exception as e:
            MqttInvalidDataFormat(
                client=client, topic=msg.topic, details=str(e), message_id=payload.msgId
            )
            return

        if params is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Request parameters not found",
                details="Request parameters not found",
            )
            return

        user_id = params.get("id", None)
        if user_id is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="User ID not found in the request parameters",
                details="User ID not found in the request parameters",
            )
            return

        with Session(self.database.engine) as session:
            result = UserPreference.add_user_preference(
                session=session, user_id=user_id, user_preference=user_preference
            )

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user_preference = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_201_CREATED,
            payload=user_preference.to_schema(),
        )

    def add_time_slot_to_user_preference(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        try:
            time_slot = TimeSlotInput(**payload.data)
        except Exception as e:
            MqttInvalidDataFormat(
                client=client, topic=msg.topic, details=str(e), message_id=payload.msgId
            )
            return

        if params is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Request parameters not found",
                details="Request parameters not found",
            )
            return

        preference_id = params.get("preference_id", None)
        if preference_id is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Preference ID not found in the request parameters",
                details="Preference ID not found in the request parameters",
            )
            return

        with Session(self.database.engine) as session:
            result = PreferredTimeSlot.add_time_slot(
                session=session, user_preference_id=preference_id, time_slot=time_slot
            )

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            time_slot = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_201_CREATED,
            payload=time_slot.to_schema(),
        )

    def update_user_preference(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        try:
            user_preference = UserPreferenceUpdate(**payload.data)
        except Exception as e:
            MqttInvalidDataFormat(
                client=client, topic=msg.topic, details=str(e), message_id=payload.msgId
            )
            return

        if params is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Request parameters not found",
                details="Request parameters not found",
            )
            return

        preference_id = params.get("preference_id", None)
        if preference_id is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Preference ID not found in the request parameters",
                details="Preference ID not found in the request parameters",
            )
            return

        with Session(self.database.engine) as session:
            result = UserPreference.update_user_preference(
                session=session,
                user_preference_id=preference_id,
                updated_user_preference=user_preference,
            )

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

            user_preference = result.unwrap()

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_200_OK,
            payload=user_preference.to_schema(),
        )

    def remove_user_preference(
        self,
        client: Client,
        userdata: Any,
        msg: MQTTMessage,
        params: Optional[Params],
        payload: MqttRequest[Any],
    ) -> None:
        if params is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Request parameters not found",
                details="Request parameters not found",
            )
            return

        preference_id = params.get("preference_id", None)
        if preference_id is None:
            MqttParametersNotFound(
                client=client,
                topic=msg.topic,
                message_id=payload.msgId,
                error_msg="Preference ID not found in the request parameters",
                details="Preference ID not found in the request parameters",
            )
            return

        with Session(self.database.engine) as session:
            result = UserPreference.remove_user_preference(
                session=session, user_preference_id=preference_id
            )

            if result.is_err():
                err = result.unwrap_err()
                handle_db_error(err=err, client=client, msg=msg, payload=payload)
                return

        MqttClient.send_response(
            client=client,
            origin_topic=msg.topic,
            message_id=payload.msgId,
            status_code=MqttStatus.STATUS_204_NO_CONTENT,
            payload=None,
        )
