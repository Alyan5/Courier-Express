from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from models.sql_models import Parcel, DeliveryAssignment, User
from utils.security import decode_token
from config.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/staff", tags=["Staff"])

def require_staff(token: str):
    payload = decode_token(token)
    if not payload or payload.get("role") != "staff":
        raise HTTPException(403, "Staff only")
    return payload

@router.get("/parcels")
def get_all_parcels(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    require_staff(token)
    return db.query(Parcel).all()

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