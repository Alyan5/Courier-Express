from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # customer, staff, rider
    created_at = Column(DateTime, default=datetime.utcnow)

class Parcel(Base):
    __tablename__ = "parcels"
    parcel_id = Column(Integer, primary_key=True)
    tracking_number = Column(String, unique=True)
    sender_id = Column(Integer, ForeignKey("users.user_id"))
    receiver_name = Column(String, nullable=False)
    receiver_phone = Column(String, nullable=False)
    receiver_address = Column(Text, nullable=False)
    weight_kg = Column(Float, nullable=False)
    charges = Column(Float, default=0.0)
    current_status = Column(String, default="booked")
    booked_at = Column(DateTime, default=datetime.utcnow)

class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"
    assignment_id = Column(Integer, primary_key=True)
    parcel_id = Column(Integer, ForeignKey("parcels.parcel_id"), unique=True)
    rider_id = Column(Integer, ForeignKey("users.user_id"))
    status = Column(String, default="assigned")

class StatusHistory(Base):
    __tablename__ = "status_history"
    history_id = Column(Integer, primary_key=True)
    parcel_id = Column(Integer, ForeignKey("parcels.parcel_id"))
    status = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow)

# Avoid creating tables at import time. Table creation can fail during
# module import if the DB is unavailable (causes app startup to crash).
# Call `Base.metadata.create_all(bind=engine)` at application startup
# instead (see `main.py`).