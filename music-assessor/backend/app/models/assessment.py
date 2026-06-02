from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.database.db import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    pitch_score = Column(Float, nullable=False)
    tempo_score = Column(Float, nullable=False)
    consistency_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    strengths = Column(Text, nullable=False)
    weaknesses = Column(Text, nullable=False)
    feedback = Column(Text, nullable=False)
    duration = Column(Float, nullable=True)
    tempo_bpm = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
