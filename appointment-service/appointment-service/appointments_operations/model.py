from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.model import BaseModel
from db.dataclasses import Response, DbErrorType
from appointments_operations.schema import AppointmentModel

class Availability(BaseModel):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dentist_id = Column(String, nullable=False)
    clinic_id = Column(String, nullable=False)
    day_of_week = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    status = Column(String, nullable=False)

    def to_schema(self) -> dict:
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "status": self.status,
            "clinic_id": self.clinic_id,
            "dentist_id": self.dentist_id,
        }

    @classmethod
    def add_appointment(cls, session: Session, appointment: AppointmentModel) -> Response["Availability"]:
        existing = (
        session.query(cls)
        .filter(
            cls.dentist_id == appointment.dentist_id.strip(),
            cls.clinic_id == appointment.clinic_id.strip(),
            cls.day_of_week == appointment.day_of_week.strip(),
            cls.start_time == appointment.start_time.strip(),
            cls.end_time == appointment.end_time.strip(),
        )
        .first()
    )

        if existing:
            return Response.as_error(
                message="Appointment already exists",
                details=f"An appointment already exists for dentist {appointment.dentist_id} on {appointment.day_of_week} "
                        f"from {appointment.start_time} to {appointment.end_time}",
                error_type=DbErrorType.RECORD_ALREADY_EXISTS,
            )
        print("Existing query result:", existing)
        try:
            new_appointment = cls(
                dentist_id=appointment.dentist_id,
                clinic_id=appointment.clinic_id,
                day_of_week=appointment.day_of_week,
                start_time=appointment.start_time,
                end_time=appointment.end_time,
                status=appointment.status,
            )

            session.add(new_appointment)
            print(f"Attempting to commit: {new_appointment}")
            session.commit()
            print(f"Committed successfully: {new_appointment}")

            created_appointment = (
                session.query(cls)
                .filter_by(id=new_appointment.id)
                .first()
            )
        except IntegrityError as e:
            session.rollback()
            print(f"IntegrityError during commit: {str(e)}")
            return Response.as_error(
                message="Database error",
                details=str(e),
                error_type=DbErrorType.RECORD_ALREADY_EXISTS,
            )

        return Response.as_success(created_appointment)
    
    @classmethod
    def get_appointment(cls, session: Session, appointment_id: str) -> Response["Availability"]:
        result = session.query(cls).filter_by(id=appointment_id).first()
        if not result:
            return Response.as_error(
                message="Appointment not found",
                details=f"No appointment with ID {appointment_id}",
                error_type=DbErrorType.RECORD_NOT_FOUND,
            )
        return Response.as_success(result)
    
    @classmethod
    def delete_appointment(cls, session: Session, appointment_id: str) -> Response[None]:
        availability = session.query(cls).filter(cls.id == appointment_id).one_or_none()

        if availability is None:
            return Response.as_error("Database error", f"Appointment with id {appointment_id} not found")

        session.delete(availability)
        session.commit()

        return Response.as_success(None)
    
    @classmethod
    def change_appointment_status(cls, session: Session, appointment_id: str, new_status: str) -> Response[None]:
        availability = session.query(cls).filter(cls.id == appointment_id).one_or_none()

        if availability is None:
            return Response.as_error("Database error", f"Appointment with id {appointment_id} not found")

        availability.status = new_status
        session.commit()

        return Response.as_success(None)