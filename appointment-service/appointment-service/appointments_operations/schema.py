from pydantic import BaseModel
from sqlalchemy.orm import DeclarativeBase
#from db.model import BaseModel
class AppointmentModel(BaseModel):
    id: str
    dentist_id: str
    clinic_id: str
    day_of_week: str
    start_time: str
    end_time: str
    status: str