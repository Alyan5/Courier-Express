from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, customer, staff, rider

from config.database import engine
from models.sql_models import Base
from sqlalchemy import inspect
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Courier & Parcel Delivery System",
    description="Full-stack courier management system with role-based access (Customer, Staff, Rider)",
    version="1.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router)
app.include_router(customer.router)
app.include_router(staff.router)
app.include_router(rider.router)

@app.get("/")
def home():
    return {"message": "Courier API is LIVE! Go to /docs for API documentation"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "courier-backend"}

@app.on_event("startup")
def on_startup():
    """Create DB tables at application startup if none exist."""
    try:
        inspector = inspect(engine)
        existing = inspector.get_table_names()
        if existing:
            logger.info(f"Database already has {len(existing)} tables: {existing}. Skipping table creation.")
        else:
            logger.info("No existing tables found. Creating database tables...")
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
    except Exception as exc:
        logger.error(f"Failed to inspect/create DB tables on startup: {exc}")