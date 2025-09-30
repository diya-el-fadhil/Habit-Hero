from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text
from database import Base
from datetime import datetime

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)  # health, work, learning, etc.
    frequency = Column(String)  # daily, weekly
    start_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer)
    date = Column(Date)
    completed = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    total_checkins = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    badges = Column(Text, default="")