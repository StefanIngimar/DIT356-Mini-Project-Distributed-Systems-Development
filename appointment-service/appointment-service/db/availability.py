from sqlalchemy import Column, Integer, String, Time
from db.model import BaseModel

class Availability(BaseModel):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, autoincrement=True)
    day_of_week = Column(String, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String, nullable=False)
