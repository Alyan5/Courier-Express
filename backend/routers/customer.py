from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from schemas.pydantic_schemas import ParcelCreate, ParcelOut
from models.sql_models import Parcel, StatusHistory, User
from utils.security import decode_token
from config.database import get_db
import logging

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/customer", tags=["Customer"])

def get_current_user(token: str = Depends(oauth2_scheme)):
    logger.info(f"Validating customer token (first 20 chars): {token[:20]}...")
    payload = decode_token(token)
    
    if not payload:
        logger.error("Token decode returned None")
        raise HTTPException(401, "Invalid or expired token")
    
    user_role = payload.get("role")
    logger.info(f"Token decoded, user role: {user_role}")
    
    if user_role != "customer":
        logger.error(f"Access denied - user role is '{user_role}', expected 'customer'")
        raise HTTPException(403, f"Customer access required. Your role: {user_role}")
    
    return payload

@router.post("/parcel/create", response_model=ParcelOut)
def create_parcel(
    parcel: ParcelCreate,
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db)
):
    user_info = get_current_user(token)
    
    # Validate user exists
    db_user = db.query(User).filter(User.email == user_info["sub"]).first()
    if not db_user:
        raise HTTPException(404, "User not found")
    
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
        sender_id=db_user.user_id,
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

    db.add(StatusHistory(parcel_id=new_parcel.parcel_id, status="booked"))
    db.commit()

    return new_parcel

@router.get("/my-parcels")
def get_my_parcels(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    """Get all parcels sent by the logged-in customer"""
    user_info = get_current_user(token)
    
    db_user = db.query(User).filter(User.email == user_info["sub"]).first()
    if not db_user:
        raise HTTPException(404, "User not found")
    
    parcels = db.query(Parcel).filter(Parcel.sender_id == db_user.user_id).all()
    return parcels

@router.get("/parcel/track/{tracking_number}", response_model=ParcelOut)
def track_parcel(tracking_number: str, db=Depends(get_db)):
    parcel = db.query(Parcel).filter(Parcel.tracking_number == tracking_number).first()
    if not parcel:
        raise HTTPException(404, "Parcel not found")
    return parcel