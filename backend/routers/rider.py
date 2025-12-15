from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from models.sql_models import DeliveryAssignment, Parcel, StatusHistory, User
from utils.security import decode_token
from config.database import get_db
import logging

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/rider", tags=["Rider"])

def require_rider(token: str):
    logger.info(f"Validating rider token (first 20 chars): {token[:20]}...")
    payload = decode_token(token)
    
    if not payload:
        logger.error("Token decode returned None")
        raise HTTPException(401, "Invalid or expired token")
    
    user_role = payload.get("role")
    logger.info(f"Token decoded, user role: {user_role}")
    
    if user_role != "rider":
        logger.error(f"Access denied - user role is '{user_role}', expected 'rider'")
        raise HTTPException(403, f"Rider access required. Your role: {user_role}")
    
    return payload

@router.get("/my-parcels")
def my_parcels(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    """Get all parcels assigned to the logged-in rider"""
    user = require_rider(token)
    db_user = db.query(User).filter(User.email == user["sub"]).first()
    
    assignments = (
        db.query(DeliveryAssignment)
        .filter(DeliveryAssignment.rider_id == db_user.user_id)
        .all()
    )
    
    # Get full parcel details for each assignment
    parcels = []
    for assignment in assignments:
        parcel = db.query(Parcel).filter(Parcel.parcel_id == assignment.parcel_id).first()
        if parcel:
            parcels.append(parcel)
    
    return parcels

@router.put("/update-status/{parcel_id}")
def update_status(parcel_id: int, new_status: str, token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    require_rider(token)
    
    # Validate parcel exists
    parcel = db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
    if not parcel:
        raise HTTPException(404, "Parcel not found")
    
    # Validate rider is assigned to this parcel
    user = require_rider(token)
    db_user = db.query(User).filter(User.email == user["sub"]).first()
    assignment = db.query(DeliveryAssignment).filter(
        DeliveryAssignment.parcel_id == parcel_id,
        DeliveryAssignment.rider_id == db_user.user_id
    ).first()
    if not assignment:
        raise HTTPException(403, "You are not assigned to this parcel")
    
    # Validate status value
    valid_statuses = ["booked", "packed", "in transit", "out for delivery", "delivered"]
    if new_status not in valid_statuses:
        raise HTTPException(400, f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    parcel.current_status = new_status
    db.add(parcel)
    db.add(StatusHistory(parcel_id=parcel_id, status=new_status))
    db.commit()
    return {"message": f"Status updated to {new_status}"}