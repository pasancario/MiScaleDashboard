from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import json
import os
from contextlib import asynccontextmanager

from src import database, models, mi_cloud

from src import database, models

models.Base.metadata.create_all(bind=database.engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup - populate db if empty
    db = database.SessionLocal()
    try:
        if True:  # Run on every boot to pick up new files
            # Load user config
            config_path = os.path.join(os.path.dirname(__file__), "..", "data", "users.json")
            users_config = []
            if os.path.exists(config_path):
                with open(config_path, "r") as f:
                    users_config = json.load(f).get("users", [])

            mock_data = mi_cloud.get_measurements()
            added_count = 0
            for row in mock_data:
                dt = datetime.strptime(row["timestamp"], "%Y-%m-%d %H:%M:%S")
                
                # Match user by height
                user_name = "Unknown"
                row_height = row.get("height")
                if row_height is not None:
                    for u in users_config:
                        # Assuming +- 1cm tolerance just in case
                        if abs(float(u["height"]) - row_height) <= 1.0:
                            user_name = u["name"]
                            break
                            
                # Check for existing record
                existing = db.query(models.Measurement).filter_by(timestamp=dt, user_name=user_name).first()
                if existing:
                    continue  # Skip duplicates

                m = models.Measurement(
                    user_name=user_name,
                    timestamp=dt,
                    weight=row["weight"],
                    body_fat=row.get("body_fat"),
                    muscle_mass=row.get("muscle_mass"),
                    water_percentage=row.get("water_percentage"),
                    bmi=row.get("bmi"),
                    bone_mass=row.get("bone_mass"),
                    basal_metabolism=row.get("basal_metabolism"),
                    visceral_fat=row.get("visceral_fat")
                )
                db.add(m)
                added_count += 1
            
            if added_count > 0:
                try:
                    db.commit()
                    print(f"Successfully seeded {added_count} new records.")
                except Exception as e:
                    db.rollback()
                    print(f"Error seeding data: {e}")
    finally:
        db.close()
    yield
    # Cleanup

app = FastAPI(title="Mi Body Composition API", version="0.0.1", lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MeasurementResponse(BaseModel):
    id: int
    user_name: str
    timestamp: datetime
    weight: float
    body_fat: float | None = None
    muscle_mass: float | None = None
    water_percentage: float | None = None
    bmi: float | None = None
    bone_mass: float | None = None
    protein_percentage: float | None = None
    basal_metabolism: float | None = None
    visceral_fat: float | None = None
    body_age: int | None = None
    ideal_weight: float | None = None

    class Config:
        orm_mode = True

@app.get("/api/users", response_model=List[str])
def get_users():
    config_path = os.path.join(os.path.dirname(__file__), "..", "data", "users.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            data = json.load(f)
            return [u["name"] for u in data.get("users", [])]
    return []

@app.get("/api/measurements", response_model=List[MeasurementResponse])
def read_measurements(
    user_name: str,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Measurement).filter(models.Measurement.user_name == user_name)
    
    if start_date:
        query = query.filter(models.Measurement.timestamp >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(models.Measurement.timestamp <= datetime.fromisoformat(end_date))
        
    measurements = query.order_by(models.Measurement.timestamp.desc()).all()
    return measurements

@app.get("/api/stats")
def read_stats(user_name: str, db: Session = Depends(database.get_db)):
    latest = db.query(models.Measurement).filter(models.Measurement.user_name == user_name).order_by(models.Measurement.timestamp.desc()).first()
    if not latest:
        return {"status": "No data"}
    return {
        "latest_weight": latest.weight,
        "latest_body_fat": latest.body_fat,
        "latest_muscle_mass": latest.muscle_mass,
        "latest_water": latest.water_percentage,
        "latest_bmi": latest.bmi,
        "last_updated": latest.timestamp
    }
