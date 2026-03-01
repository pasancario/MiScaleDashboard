from sqlalchemy import Column, Integer, Float, String, DateTime
from src.database import Base
from datetime import datetime

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    weight = Column(Float, index=True)
    body_fat = Column(Float, nullable=True)
    muscle_mass = Column(Float, nullable=True)
    water_percentage = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    bone_mass = Column(Float, nullable=True)
    protein_percentage = Column(Float, nullable=True)
    basal_metabolism = Column(Float, nullable=True)
    visceral_fat = Column(Float, nullable=True)
    body_age = Column(Integer, nullable=True)
    ideal_weight = Column(Float, nullable=True)
