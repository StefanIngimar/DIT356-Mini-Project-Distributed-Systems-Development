from typing import Tuple, List, Iterable, Type, cast
from datetime import time, date, datetime
from dataclasses import asdict

from sqlalchemy import Boolean, Column, Date, String, ForeignKey, Time
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload, relationship, Session

from core.model import WeekDay

from db.model import BaseModel
from db.dataclasses import DbResult, DbErrorType

from auth.encryption import hash_password, is_correct_password

from user.schema import (
    DayOfWeek,
    TimeSlotOutput,
    UserInput,
    UserOutput,
    UserPreferenceInput,
    UserPreferenceOutput,
    UserPreferenceUpdate,
    UserRoleOutput,
    TimeSlotInput,
)


class UserRole(BaseModel):
    __tablename__ = "user_role"

    role = Column(String, nullable=False, unique=True)

    # one-to-many
    users = relationship("User", back_populates="role")

    @classmethod
    def get_or_create(
        cls, session: Session, role: str
    ) -> DbResult[Tuple["UserRole", bool]]:
        created = False
        user_role = session.query(cls).filter_by(role=role).first()

        if user_role is None:
            created = True
            result = cls.add_user_role(session=session, role=role)
            if result.is_err():
                return DbResult.as_error(**asdict(result.unwrap_err()))

            user_role = result.unwrap()

        return DbResult.as_success(
            data=(
                user_role,
                created,
            )
        )

    @classmethod
    def add_user_role(cls, session: Session, role: str) -> DbResult["UserRole"]:
        try:
            new_role = UserRole(role=role)
            session.add(new_role)
            session.commit()
        except IntegrityError:
            session.rollback()
            return DbResult.as_error(
                message="This role already exists",
                details=f"Role '{role}' violates unique constraint",
                error_type=DbErrorType.RECORD_ALREADY_EXIST,
            )

        return DbResult.as_success(data=new_role)

    @classmethod
    def get_roles(cls, session: Session) -> DbResult[List["UserRole"]]:
        roles = session.query(cls).all()

        return DbResult.as_success(data=roles)

    @classmethod
    def remove_role_by_name(cls, session: Session, name: str) -> DbResult[None]:
        role = session.query(cls).filter_by(role=name).first()
        if role is None:
            return DbResult.as_error(
                message="Role does not exist",
                details=f"No role was found with name '{name}'",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )

        try:
            session.delete(role)
            session.commit()
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not delete a role",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=None)

    def to_schema(self) -> UserRoleOutput:
        return UserRoleOutput(id=str(self.id), role=str(self.role))


class PreferredTimeSlot(BaseModel):
    __tablename__ = "preferred_time_slot"

    start_time = Column(Time, nullable=False)
    user_preference_id = Column(
        String, ForeignKey("user_preference.id"), nullable=False
    )

    # many-to-one
    preference = relationship("UserPreference", back_populates="time_slots")

    @classmethod
    def add_time_slot(
        cls, session: Session, user_preference_id: str, time_slot: TimeSlotInput
    ) -> DbResult["PreferredTimeSlot"]:
        try:
            hour, minutes = time_slot.start_time.split(":")
            new_time_slot = PreferredTimeSlot(
                start_time=time(hour=int(hour), minute=int(minutes)),
                user_preference_id=user_preference_id,
            )
            session.add(new_time_slot)
            session.commit()

            session.refresh(new_time_slot)
        except IntegrityError:
            session.rollback()
            return DbResult.as_error(
                message="Time slot already exists",
                details="Time slot already exists",
                error_type=DbErrorType.RECORD_ALREADY_EXIST,
            )
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while adding new time slot",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=new_time_slot)

    @classmethod
    def add_time_slots(
        cls,
        session: Session,
        user_preference_id: str,
        time_slots: Iterable[TimeSlotInput],
    ) -> DbResult[List["PreferredTimeSlot"]]:
        try:
            new_time_slots = []
            for time_slot in time_slots:
                hour, minutes = time_slot.start_time.split(":")
                new_time_slots.append(
                    PreferredTimeSlot(
                        start_time=time(hour=int(hour), minute=int(minutes)),
                        user_preference_id=user_preference_id,
                    )
                )

            session.add_all(new_time_slots)
            session.commit()
        except IntegrityError:
            session.rollback()
            return DbResult.as_error(
                message="Time slot already exists",
                details="Time slot already exists",
                error_type=DbErrorType.RECORD_ALREADY_EXIST,
            )
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while adding time slots",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=new_time_slots)

    @classmethod
    def remove_time_slot(cls, session: Session, time_slot_id: str) -> DbResult[None]:
        time_slot = session.query(cls).filter_by(id=time_slot_id).first()
        if time_slot is None:
            return DbResult.as_error(
                message="Time slot does not exist",
                details=f"There is no time slot with ID '{time_slot_id}'",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )

        try:
            session.delete(time_slot)
            session.commit()
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not delete a time slot",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=None)

    def to_schema(self) -> TimeSlotOutput:
        return TimeSlotOutput(
            id=str(self.id), start_time=str(self.start_time.strftime("%H:%M"))
        )


class UserPreferenceWeekDay(BaseModel):
    __tablename__ = "user_preference_week_day"

    user_preference_id = Column(
        String, ForeignKey("user_preference.id"), nullable=False
    )
    week_day_id = Column(String, ForeignKey("week_day.id"), nullable=False)

    @classmethod
    def add_preference_week_days(
        cls, session: Session, user_preference_id: str, week_days: Iterable[DayOfWeek]
    ) -> DbResult["List[UserPreferenceWeekDay]"]:
        try:
            new_preference_week_days = []
            for week_day in week_days:
                week_day_result = WeekDay.get_or_create(
                    session=session, week_day=week_day
                )
                if week_day_result.is_err():
                    session.rollback()
                    return DbResult.as_error(**asdict(week_day_result.unwrap_err()))

                existing_week_day, _ = week_day_result.unwrap()

                new_preference_week_days.append(
                    UserPreferenceWeekDay(
                        user_preference_id=user_preference_id,
                        week_day_id=existing_week_day.id,
                    )
                )

            session.add_all(new_preference_week_days)
            session.commit()
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not add week days to the user preference",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=new_preference_week_days)

    @classmethod
    def remove_preference_week_days(
        cls, session: Session, user_preference_id: str
    ) -> DbResult[None]:
        try:
            user_preference_week_days = (
                session.query(cls)
                .filter_by(user_preference_id=user_preference_id)
                .all()
            )
            for user_preference_week_day in user_preference_week_days:
                session.delete(user_preference_week_day)
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not remove user preference week days",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=None)

    @classmethod
    def update_preference_week_days(
        cls,
        session: Session,
        user_preference_id: str,
        updated_week_days: Iterable[DayOfWeek],
    ) -> DbResult[List["UserPreferenceWeekDay"]]:
        try:
            cls.remove_preference_week_days(
                session=session, user_preference_id=user_preference_id
            )
            result = cls.add_preference_week_days(
                session=session,
                user_preference_id=user_preference_id,
                week_days=updated_week_days,
            )
            if result.is_err():
                return DbResult.as_error(**asdict(result.unwrap_err()))
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not update user preference week days",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=result.unwrap())


class UserPreference(BaseModel):
    __tablename__ = "user_preference"

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    user_id = Column(String, ForeignKey("user_account.id"), nullable=False)

    # one-to-many
    time_slots = relationship(
        "PreferredTimeSlot", back_populates="preference", cascade="all, delete-orphan"
    )

    # many-to-one
    user = relationship("User", back_populates="preferences")

    # many-to-many
    days_of_week = relationship(
        "WeekDay",
        secondary="user_preference_week_day",
    )

    @classmethod
    def add_user_preference(
        cls, session: Session, user_id: str, user_preference: UserPreferenceInput
    ) -> DbResult["UserPreference"]:
        try:
            new_user_preference = UserPreference(
                start_date=user_preference.start_date,
                end_date=user_preference.end_date,
                is_active=user_preference.is_active,
                user_id=user_id,
            )
            session.add(new_user_preference)
            session.commit()

            time_slot_result = PreferredTimeSlot.add_time_slots(
                session=session,
                user_preference_id=str(new_user_preference.id),
                time_slots=user_preference.time_slots,
            )
            if time_slot_result.is_err():
                session.rollback()
                return DbResult.as_error(**asdict(time_slot_result.unwrap_err()))

            week_day_result = UserPreferenceWeekDay.add_preference_week_days(
                session=session,
                user_preference_id=str(new_user_preference.id),
                week_days=user_preference.days_of_week,
            )
            if week_day_result.is_err():
                session.rollback()
                return DbResult.as_error(**asdict(week_day_result.unwrap_err()))

            created_user_preference = (
                session.query(cls)
                .options(
                    joinedload(cls.time_slots),
                    joinedload(cls.days_of_week),
                )
                .filter_by(id=new_user_preference.id)
                .first()
            )

        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while adding user preference",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=created_user_preference)

    @classmethod
    def get_users_preferences(cls, session: Session) -> DbResult["List[UserPreference]"]:
        try:
            users_preferences = (
                session.query(cls)
                .options(
                    joinedload(cls.time_slots),
                    joinedload(cls.days_of_week),
                )
                .all()
            )
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while getting users preferences",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=users_preferences)


    @classmethod
    def get_user_preferences(
        cls, session: Session, user_id: str
    ) -> DbResult["List[UserPreference]"]:
        try:
            user_preferences = (
                session.query(cls)
                .filter_by(user_id=user_id)
                .options(
                    joinedload(cls.time_slots),
                    joinedload(cls.days_of_week),
                )
                .all()
            )
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while getting user preference",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=user_preferences)

    @classmethod
    def update_user_preference(
        cls,
        session: Session,
        user_preference_id: str,
        updated_user_preference: UserPreferenceUpdate,
    ) -> DbResult["UserPreference"]:
        try:
            user_preference = (
                session.query(cls)
                .options(
                    joinedload(cls.time_slots),
                    joinedload(cls.days_of_week),
                )
                .filter_by(id=user_preference_id)
                .first()
            )
            if user_preference is None:
                return DbResult.as_error(
                    message="User preference does not exist",
                    details=f"There is no user preference with ID '{user_preference_id}'",
                    error_type=DbErrorType.RECORD_NOT_FOUND,
                )

            updated_user_preference_data = updated_user_preference.model_dump()

            if updated_user_preference.days_of_week:
                update_week_days_result = (
                    UserPreferenceWeekDay.update_preference_week_days(
                        session=session,
                        user_preference_id=user_preference_id,
                        updated_week_days=updated_user_preference.days_of_week,
                    )
                )
                if update_week_days_result.is_err():
                    session.rollback()
                    return DbResult.as_error(**asdict(update_week_days_result))
                del updated_user_preference_data["days_of_week"]

            for key, value in updated_user_preference_data.items():
                if value is not None:
                    setattr(user_preference, key, value)

            session.commit()

            session.refresh(user_preference)
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while updating user preference",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=user_preference)

    @classmethod
    def remove_user_preference(
        cls, session: Session, user_preference_id: str
    ) -> DbResult[None]:
        try:
            user_preference = session.get(entity=cls, ident=user_preference_id)
            if user_preference is None:
                return DbResult.as_error(
                    message="User preference does not exist",
                    details=f"There is no user preference with ID '{id}'",
                    error_type=DbErrorType.RECORD_NOT_FOUND,
                )
            session.delete(user_preference)
            session.commit()
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while user preference",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=None)

    def to_schema(self) -> UserPreferenceOutput:
        return UserPreferenceOutput(
            id=str(self.id),
            user_id=str(self.user_id),
            start_date=cast(date, self.start_date),
            end_date=cast(date, self.end_date),
            is_active=cast(bool, self.is_active),
            days_of_week=[day_of_week.to_schema() for day_of_week in self.days_of_week],
            time_slots=[time_slot.to_schema() for time_slot in self.time_slots],
        )


class User(BaseModel):
    __tablename__ = "user_account"

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    role_id = Column(String, ForeignKey("user_role.id"), nullable=False)

    # many-to-one
    role = relationship("UserRole", back_populates="users")

    # one-to-many
    preferences = relationship(
        "UserPreference", back_populates="user", cascade="all, delete-orphan"
    )

    @classmethod
    def add_user(cls, session: Session, user: UserInput) -> DbResult["User"]:
        result = UserRole.get_or_create(session=session, role=user.role)
        if result.is_err():
            return DbResult.as_error(**asdict(result.unwrap_err()))

        role_output, _ = result.unwrap()

        try:
            new_user = User(
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                password=hash_password(user.password),
                role_id=role_output.id,
            )
            session.add(new_user)
            session.commit()

            created_user = (
                session.query(cls)
                .options(joinedload(cls.role))
                .filter_by(email=new_user.email)
                .first()
            )
        except IntegrityError:
            session.rollback()
            return DbResult.as_error(
                message="User already exists",
                details=f"User with email '{user.email}' already exists",
                error_type=DbErrorType.RECORD_ALREADY_EXIST,
            )

        return DbResult.as_success(created_user)

    @classmethod
    def get_users(cls, session: Session) -> DbResult[List["User"]]:
        try:
            users = session.query(cls).options(joinedload(cls.role)).all()
        except Exception as e:
            return DbResult.as_error(
                message="Something went wrong while getting users",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=users)

    @classmethod
    def get_user_by_id(cls, session: Session, id: str) -> DbResult["User"]:
        user = session.query(cls).filter_by(id=id).options(joinedload(cls.role)).first()
        if user is None:
            return DbResult.as_error(
                message="User does not exist",
                details=f"There is no user with ID '{id}'",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )

        return DbResult.as_success(data=user)

    @classmethod
    def get_user_by_email(cls, session: Session, email: str) -> DbResult["User"]:
        user = session.query(cls).filter_by(email=email).first()
        if user is None:
            return DbResult.as_error(
                message="User does not exist",
                details=f"There is no user with email '{email}'",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )

        return DbResult.as_success(data=user)

    @classmethod
    def remove_user_by_id(cls, session: Session, id: str) -> DbResult[None]:
        user = session.get(entity=cls, ident=id)
        if user is None:
            return DbResult.as_error(
                message="User does not exist",
                details=f"There is no user with ID '{id}'",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )

        try:
            session.delete(user)
            session.commit()
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not delete a user",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=None)

    @classmethod
    def remove_user_by_email(cls, session: Session, email: str) -> DbResult[None]:
        user = session.query(cls).filter_by(email=email).first()
        if user is None:
            return DbResult.as_error(
                message="User does not exist",
                details=f"There is no user with email '{email}'",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )

        try:
            session.delete(user)
            session.commit()
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Could not delete a user",
                details=f"{e}",
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=None)

    def is_correct_password(self, plain_password: str) -> bool:
        return is_correct_password(
            plain_password=plain_password, hashed_password=str(self.password)
        )

    def to_schema(self) -> UserOutput:
        return UserOutput(
            id=str(self.id),
            first_name=str(self.first_name),
            last_name=str(self.last_name),
            email=str(self.email),
            role=self.role.role,
        )
