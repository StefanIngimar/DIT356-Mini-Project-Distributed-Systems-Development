import pytest
from datetime import date, time

from sqlalchemy.orm.session import Session

from db.sqlite import Sqlite
from user.model import UserPreference, User
from user.schema import (
    TimeSlotInput,
    UserInput,
    UserPreferenceInput,
    UserPreferenceUpdate,
)
from core.schema import DayOfWeek


@pytest.fixture
def db() -> Sqlite:
    return Sqlite(db_path="sqlite:///:memory:")


def test_add_user_preference(db: Sqlite):
    with Session(db.engine) as session:
        user_result = User.add_user(
            session=session,
            user=UserInput(
                first_name="Joe",
                last_name="Doe",
                email="joeDoe@email.com",
                role="admin",
                password="admin",
            ),
        )

        assert user_result.is_ok() is True
        added_user = user_result.unwrap()

        user_preference_result = UserPreference.add_user_preference(
            session=session,
            user_id=str(added_user.id),
            user_preference=UserPreferenceInput(
                start_date=date(2024, 12, 5),
                end_date=date(2024, 12, 10),
                is_active=True,
                time_slots=[
                    TimeSlotInput(start_time="10:15"),
                    TimeSlotInput(start_time="11:15"),
                    TimeSlotInput(start_time="12:15"),
                ],
                days_of_week=[DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
            ),
        )
        assert user_preference_result.is_ok() is True

        added_user_preference = user_preference_result.unwrap()

        assert added_user_preference.start_date == date(2024, 12, 5)
        assert added_user_preference.end_date == date(2024, 12, 10)
        assert added_user_preference.is_active is True

        assert len(added_user_preference.time_slots) == 3
        assert added_user_preference.time_slots[0].start_time == time(
            hour=10, minute=15
        )
        assert added_user_preference.time_slots[1].start_time == time(
            hour=11, minute=15
        )
        assert added_user_preference.time_slots[2].start_time == time(
            hour=12, minute=15
        )

        assert len(added_user_preference.days_of_week) == 2
        assert str(added_user_preference.days_of_week[0].name) == "monday"
        assert str(added_user_preference.days_of_week[1].name) == "tuesday"

        session.rollback()


def test_get_user_preferences_no_preferences_for_user(db: Sqlite):
    with Session(db.engine) as session:
        result = UserPreference.get_user_preferences(
            session=session, user_id="invalid_id"
        )

        assert result.is_ok() is True

        user_preferences = result.unwrap()
        assert user_preferences == []

        session.rollback()


def test_get_user_preferences(db: Sqlite):
    with Session(db.engine) as session:
        user_result = User.add_user(
            session=session,
            user=UserInput(
                first_name="Joe",
                last_name="Doe",
                email="joeDoe@email.com",
                role="admin",
                password="admin",
            ),
        )

        assert user_result.is_ok() is True
        added_user = user_result.unwrap()

        UserPreference.add_user_preference(
            session=session,
            user_id=str(added_user.id),
            user_preference=UserPreferenceInput(
                start_date=date(2024, 12, 5),
                end_date=date(2024, 12, 10),
                is_active=True,
                time_slots=[
                    TimeSlotInput(start_time="10:15"),
                    TimeSlotInput(start_time="11:15"),
                    TimeSlotInput(start_time="12:15"),
                ],
                days_of_week=[DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
            ),
        )

        user_preferences_result = UserPreference.get_user_preferences(
            session=session, user_id=added_user.id
        )

        assert user_preferences_result.is_ok() is True

        user_preferences = user_preferences_result.unwrap()

        assert len(user_preferences) == 1
        user_preferences = user_preferences[0]

        assert user_preferences.start_date == date(2024, 12, 5)
        assert user_preferences.end_date == date(2024, 12, 10)
        assert user_preferences.is_active is True

        assert len(user_preferences.time_slots) == 3
        assert user_preferences.time_slots[0].start_time == time(hour=10, minute=15)
        assert user_preferences.time_slots[1].start_time == time(hour=11, minute=15)
        assert user_preferences.time_slots[2].start_time == time(hour=12, minute=15)

        assert len(user_preferences.days_of_week) == 2
        assert str(user_preferences.days_of_week[0].name) == "monday"
        assert str(user_preferences.days_of_week[1].name) == "tuesday"

        session.rollback()


def test_update_user_preference(db: Sqlite):
    with Session(db.engine) as session:
        user_result = User.add_user(
            session=session,
            user=UserInput(
                first_name="Joe",
                last_name="Doe",
                email="joeDoe@email.com",
                role="admin",
                password="admin",
            ),
        )

        assert user_result.is_ok() is True
        added_user = user_result.unwrap()

        user_preference_result = UserPreference.add_user_preference(
            session=session,
            user_id=str(added_user.id),
            user_preference=UserPreferenceInput(
                start_date=date(2024, 12, 5),
                end_date=date(2024, 12, 10),
                is_active=True,
                time_slots=[
                    TimeSlotInput(start_time="10:15"),
                    TimeSlotInput(start_time="11:15"),
                    TimeSlotInput(start_time="12:15"),
                ],
                days_of_week=[DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
            ),
        )
        assert user_preference_result.is_ok() is True

        added_user_preference = user_preference_result.unwrap()

        assert added_user_preference.start_date == date(2024, 12, 5)
        assert added_user_preference.end_date == date(2024, 12, 10)
        assert added_user_preference.is_active is True

        assert len(added_user_preference.days_of_week) == 2
        assert str(added_user_preference.days_of_week[0].name) == "monday"
        assert str(added_user_preference.days_of_week[1].name) == "tuesday"

        updated_user_preference_result = UserPreference.update_user_preference(
            session=session,
            user_preference_id=added_user_preference.id,
            updated_user_preference=UserPreferenceUpdate(
                start_date=date(2024, 12, 15),
                end_date=date(2024, 12, 25),
                is_active=False,
                days_of_week=[DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
            ),
        )

        assert updated_user_preference_result.is_ok() is True

        updated_user_preference = updated_user_preference_result.unwrap()

        assert updated_user_preference.start_date == date(2024, 12, 15)
        assert updated_user_preference.end_date == date(2024, 12, 25)
        assert updated_user_preference.is_active is False

        assert len(added_user_preference.days_of_week) == 2
        assert str(added_user_preference.days_of_week[0].name) == "saturday"
        assert str(added_user_preference.days_of_week[1].name) == "sunday"
