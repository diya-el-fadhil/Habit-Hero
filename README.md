# Habit Hero

A habit tracking application to build better routines and stay consistent.

## Core Features

* Create habits with name, frequency (daily, weekly), category (health, work, learning), and start date
* Track progress with check-ins or notes
* View analytics: streaks, success rate, best days
* Categorize habits (fitness, mental health, productivity)

## Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart

# Run server
python main.py
