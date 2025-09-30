from pydantic import BaseModel
from datetime import date
from typing import Optional

class HabitCreate(BaseModel):
    name: str
    category: str
    frequency: str
    start_date: date

class HabitResponse(BaseModel):
    id: int
    name: str
    category: str
    frequency: str
    start_date: date

    class Config:
        from_attributes = True

class CheckInCreate(BaseModel):
    habit_id: int
    date: date
    completed: bool
    notes: Optional[str] = None

class CheckInResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    completed: bool
    notes: Optional[str]

    class Config:
        from_attributes = True