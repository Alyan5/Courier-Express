from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from models.sql_models import Parcel, DeliveryAssignment, User, StatusHistory
from schemas.pydantic_schemas import ParcelCreate, ParcelOut
from utils.security import decode_token
from config.database import get_db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/staff", tags=["Staff"])

def require_staff(token: str):
    logger.info(f"Validating staff token (first 20 chars): {token[:20]}...")
    payload = decode_token(token)
    
    if not payload:
        logger.error("Token decode returned None")
        raise HTTPException(401, "Invalid or expired token")
    
    user_role = payload.get("role")
    logger.info(f"Token decoded, user role: {user_role}")
    
    if user_role != "staff":
        logger.error(f"Access denied - user role is '{user_role}', expected 'staff'")
        raise HTTPException(403, f"Staff access required. Your role: {user_role}")
    
    return payload

@router.get("/parcels")
def get_all_parcels(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    require_staff(token)
    return db.query(Parcel).all()

@router.get("/parcel/{parcel_id}")
def get_parcel_by_id(parcel_id: int, token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    require_staff(token)
    parcel = db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
    if not parcel:
        raise HTTPException(404, "Parcel not found")
    return parcel

@router.get("/riders")
def get_all_riders(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    """Get list of all riders for assignment"""
    require_staff(token)
    riders = db.query(User).filter(User.role == "rider").all()
    return [{"user_id": r.user_id, "name": r.name, "email": r.email, "phone": r.phone} for r in riders]

@router.post("/assign-rider")
def assign_rider(parcel_id: int, rider_id: int, token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    require_staff(token)
    
    # Validate parcel exists
    parcel = db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
    if not parcel:
        raise HTTPException(404, "Parcel not found")
    
    # Validate rider exists and is a rider
    rider = db.query(User).filter(User.user_id == rider_id, User.role == "rider").first()
    if not rider:
        raise HTTPException(404, "Rider not found")
    
    # Check if already assigned
    existing = db.query(DeliveryAssignment).filter(DeliveryAssignment.parcel_id == parcel_id).first()
    if existing:
        raise HTTPException(400, "Parcel already assigned to a rider")
    
    assignment = DeliveryAssignment(parcel_id=parcel_id, rider_id=rider_id)
    db.add(assignment)
    db.commit()
    return {"message": "Rider assigned successfully!"}

@router.post("/parcel/create", response_model=ParcelOut)
def create_parcel_as_staff(
    parcel: ParcelCreate,
    customer_email: str,
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db)
):
    """Staff can create parcels on behalf of customers"""
    require_staff(token)
    
    # Find the customer by email
    customer = db.query(User).filter(User.email == customer_email, User.role == "customer").first()
    if not customer:
        raise HTTPException(404, f"Customer with email '{customer_email}' not found")
    
    # Validate weight
    if parcel.weight_kg <= 0:
        raise HTTPException(400, "Weight must be greater than 0")
    
    # Validate receiver details
    if not parcel.receiver_name or not parcel.receiver_name.strip():
        raise HTTPException(400, "Receiver name is required")
    if not parcel.receiver_phone or not parcel.receiver_phone.strip():
        raise HTTPException(400, "Receiver phone is required")
    if not parcel.receiver_address or not parcel.receiver_address.strip():
        raise HTTPException(400, "Receiver address is required")

    charges = parcel.weight_kg * 50  # Rs.50 per kg

    new_parcel = Parcel(
        sender_id=customer.user_id,
        receiver_name=parcel.receiver_name,
        receiver_phone=parcel.receiver_phone,
        receiver_address=parcel.receiver_address,
        weight_kg=parcel.weight_kg,
        charges=charges,
        tracking_number=f"TRK{datetime.now().strftime('%Y%m%d%H%M%S')}",
        current_status="booked"
    )
    db.add(new_parcel)
    db.commit()
    db.refresh(new_parcel)
    
    # Add status history
    status_entry = StatusHistory(
        parcel_id=new_parcel.parcel_id,
        status="booked"
    )
    db.add(status_entry)
    db.commit()
    
    return new_parcel

@router.put("/parcel/{parcel_id}", response_model=ParcelOut)
def update_parcel(
    parcel_id: int,
    parcel: ParcelCreate,
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db)
):
    """Staff can update/edit parcel details"""
    require_staff(token)
    
    # Find the parcel
    db_parcel = db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
    if not db_parcel:
        raise HTTPException(404, "Parcel not found")
    
    # Validate weight
    if parcel.weight_kg <= 0:
        raise HTTPException(400, "Weight must be greater than 0")
    
    # Validate receiver details
    if not parcel.receiver_name or not parcel.receiver_name.strip():
        raise HTTPException(400, "Receiver name is required")
    if not parcel.receiver_phone or not parcel.receiver_phone.strip():
        raise HTTPException(400, "Receiver phone is required")
    if not parcel.receiver_address or not parcel.receiver_address.strip():
        raise HTTPException(400, "Receiver address is required")
    
    # Update parcel details
    db_parcel.receiver_name = parcel.receiver_name
    db_parcel.receiver_phone = parcel.receiver_phone
    db_parcel.receiver_address = parcel.receiver_address
    db_parcel.weight_kg = parcel.weight_kg
    db_parcel.charges = parcel.weight_kg * 50  # Recalculate charges
    
    db.commit()
    db.refresh(db_parcel)
    
    # Add status history for the update
    status_entry = StatusHistory(
        parcel_id=db_parcel.parcel_id,
        status=db_parcel.current_status
    )
    db.add(status_entry)
    db.commit()
    
    return db_parcel