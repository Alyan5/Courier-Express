from fastapi import APIRouter, Depends, HTTPException
from schemas.pydantic_schemas import UserCreate, LoginRequest, UserOut, Token
from models.sql_models import User
from utils.security import get_password_hash, create_access_token, verify_password
from config.database import get_db
import logging
import traceback

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db=Depends(get_db)):
    try:
        # Log sanitized incoming registration attempt (do NOT log raw password)
        try:
            pw_len = len(user.password.encode('utf-8')) if user.password else 0
        except Exception:
            pw_len = -1
        logger.info(f"Register attempt: email={user.email}, name={user.name}, role={user.role}, phone_present={bool(user.phone)}, pw_bytes={pw_len}")
        
        # Validate inputs
        if not user.name or not user.name.strip():
            raise HTTPException(400, "Name is required")
        if not user.email or not user.email.strip():
            raise HTTPException(400, "Email is required")
        if not user.password or len(user.password) < 6:
            raise HTTPException(400, "Password must be at least 6 characters")
        if user.role not in ["customer", "staff", "rider"]:
            raise HTTPException(400, "Invalid role. Must be customer, staff, or rider")
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(400, "Email already registered")
        
        # Hash password (get_password_hash handles long passwords via SHA-256 hashing)
        hashed = get_password_hash(user.password)
        
        new_user = User(
            name=user.name,
            email=user.email,
            phone=user.phone,
            password_hash=hashed,
            role=user.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        # Return a dict instead of ORM object to avoid Pydantic serialization issues
        return {
            "user_id": new_user.user_id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    except HTTPException:
        raise
    except Exception as e:
        # Log full exception with traceback for debugging (server-side only)
        logger.exception("Registration error")
        db.rollback()
        raise HTTPException(500, "Registration failed — server error")

@router.post("/login", response_model=Token)
def login(user: LoginRequest, db=Depends(get_db)):
    try:
        # Validate inputs
        if not user.email or not user.email.strip():
            raise HTTPException(400, "Email is required")
        if not user.password:
            raise HTTPException(400, "Password is required")
        
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.password_hash):
            raise HTTPException(401, "Invalid email or password")
        
        token = create_access_token({"sub": db_user.email, "role": db_user.role})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(500, "Login failed")