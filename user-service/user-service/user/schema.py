from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field

from core.schema import DayOfWeek


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    role: str


class UserInput(UserBase):
    password: str


class UserOutput(UserBase):
    id: str


class UserRole(BaseModel):
    role: str


class UserRoleOutput(UserRole):
    id: str


class UserLogin(BaseModel):
    email: str
    password: str


class TimeSlotBase(BaseModel):
    start_time: str  # like: '8:00'


class TimeSlotInput(TimeSlotBase):
    pass


class TimeSlotOutput(TimeSlotBase):
    id: str


class UserPreferenceBase(BaseModel):
    start_date: date
    end_date: date
    is_active: bool
    days_of_week: List[DayOfWeek]


class UserPreferenceInput(UserPreferenceBase):
    time_slots: List[TimeSlotInput]


class UserPreferenceOutput(UserPreferenceBase):
    id: str
    user_id: str
    time_slots: List[TimeSlotOutput]


class UserPreferenceUpdate(BaseModel):
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)
    days_of_week: Optional[List[DayOfWeek]] = Field(default=None)
