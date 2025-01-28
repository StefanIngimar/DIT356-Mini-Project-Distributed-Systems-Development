from dataclasses import asdict
from typing import Tuple

from sqlalchemy import Column, Enum
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.model import BaseModel
from db.dataclasses import DbErrorType, DbResult
from core.schema import DayOfWeek


class WeekDay(BaseModel):
    __tablename__ = "week_day"

    name = Column(
        Enum(
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            name="day_name",
        ),
        unique=True,
        nullable=False,
    )

    @classmethod
    def get_or_create(
        cls, session: Session, week_day: DayOfWeek
    ) -> DbResult[Tuple["WeekDay", bool]]:
        created = False
        existing_week_day = session.query(cls).filter_by(name=week_day.value).first()

        if existing_week_day is None:
            created = True
            result = cls.add_week_day(session=session, week_day=week_day)
            if result.is_err():
                return DbResult.as_error(**asdict(result.unwrap_err()))

            existing_week_day = result.unwrap()

        return DbResult.as_success(data=(existing_week_day, created))

    @classmethod
    def add_week_day(cls, session: Session, week_day: DayOfWeek) -> DbResult["WeekDay"]:
        try:
            new_week_day = WeekDay(name=week_day.value)
            session.add(new_week_day)
            session.commit()
        except IntegrityError:
            session.rollback()
            return DbResult.as_error(
                message=f"'{week_day.value}' already exists",
                details=f"Week day '{week_day.value}' violates unique constraint",
                error_type=DbErrorType.RECORD_ALREADY_EXIST,
            )
        except Exception as e:
            session.rollback()
            return DbResult.as_error(
                message="Something went wrong while adding week day",
                details=str(e),
                error_type=DbErrorType.UNKNOWN_ERROR,
            )

        return DbResult.as_success(data=new_week_day)

    def to_schema(self) -> DayOfWeek:
        return DayOfWeek(self.name)
