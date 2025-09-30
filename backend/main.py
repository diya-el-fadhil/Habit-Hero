from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import engine, get_db
from datetime import date, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Habit Hero API"}

# Create habit
@app.post("/habits/", response_model=schemas.HabitResponse)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db)):
    db_habit = models.Habit(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

# Get all habits
@app.get("/habits/", response_model=List[schemas.HabitResponse])
def get_habits(db: Session = Depends(get_db)):
    habits = db.query(models.Habit).all()
    return habits

# Get single habit
@app.get("/habits/{habit_id}", response_model=schemas.HabitResponse)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

# Delete habit
@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}

# Create check-in
@app.post("/checkins/", response_model=schemas.CheckInResponse)
def create_checkin(checkin: schemas.CheckInCreate, db: Session = Depends(get_db)):
    db_checkin = models.CheckIn(**checkin.dict())
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

# Get check-ins for a habit
@app.get("/checkins/{habit_id}", response_model=List[schemas.CheckInResponse])
def get_checkins(habit_id: int, db: Session = Depends(get_db)):
    checkins = db.query(models.CheckIn).filter(
        models.CheckIn.habit_id == habit_id
    ).all()
    return checkins

# Get analytics for a habit
@app.get("/analytics/{habit_id}")
def get_analytics(habit_id: int, db: Session = Depends(get_db)):
    checkins = db.query(models.CheckIn).filter(
        models.CheckIn.habit_id == habit_id,
        models.CheckIn.completed == True
    ).all()
    
    if not checkins:
        return {
            "streak": 0,
            "success_rate": 0,
            "total_checkins": 0
        }
    
    # Calculate streak
    sorted_dates = sorted([c.date for c in checkins], reverse=True)
    streak = 1
    for i in range(len(sorted_dates) - 1):
        diff = (sorted_dates[i] - sorted_dates[i + 1]).days
        if diff == 1:
            streak += 1
        else:
            break
    
    # Calculate success rate
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    days_since_start = (date.today() - habit.start_date).days + 1
    success_rate = (len(checkins) / days_since_start) * 100 if days_since_start > 0 else 0
    
    return {
        "streak": streak,
        "success_rate": round(success_rate, 2),
        "total_checkins": len(checkins)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)