import pytest
from sqlalchemy.orm import Session
from db.db import Database
from db.dataclasses import DbErrorType
from appointments_operations.model import Availability
from appointments_operations.schema import AppointmentModel

@pytest.fixture
def db() -> Database:
    db = Database(db_path="sqlite:///:memory:")
    return db
    #return Database(db_path="sqlite:///:memory:")
    #return db

def test_add_appointment(db: Database):
    with Session(db.engine) as session:
        appointment_data = AppointmentModel(
            id="1091923809143847",
            dentist_id="101",
            day_of_week="2024-11-30",
            start_time="09:00",
            end_time="17:00",
            status="FREE"
        )

    result = Availability.add_appointment(session=session, appointment=appointment_data)
    assert result.is_ok() is True

def test_get_appointment(db: Database):
    with Session(db.engine) as session:
        appointment_data = AppointmentModel(
            id="1091923809143847",
            dentist_id="101",
            day_of_week="2024-11-30",
            start_time="09:00",
            end_time="17:00",
            status="FREE"
        )

    Availability.add_appointment(session=session, appointment=appointment_data)
    result = Availability.get_appointment(session=session, appointment_id="1091923809143847")
    assert result.is_ok() is True
