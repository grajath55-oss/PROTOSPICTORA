from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from google.oauth2 import id_token
from google.auth.transport import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import jwt
import os
import logging

# ---------------- ENV ----------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")

# ---------------- DB ----------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------------- APP ----------------
app = FastAPI(title="StockPics API", version="1.0.0")

# ✅ CORS — MUST COME FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH DEPENDENCY ----------------
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"google_id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- STATIC FILES ----------------
uploads_dir = ROOT_DIR / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# ---------------- ROUTERS ----------------
from routes.images import router as images_router
from routes.payments import router as payments_router
from routes.purchases import router as purchases_router
from routes.admin import router as admin_router
from routes.me import router as me_router
from routes.auth import router as auth_router

app.include_router(me_router)
app.include_router(admin_router)
app.include_router(purchases_router)
app.include_router(images_router)
app.include_router(payments_router)
app.include_router(auth_router)

# ---------------- MODELS ----------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class GoogleAuthRequest(BaseModel):
    token: str

# ---------------- ROUTES ----------------
@app.get("/api")
async def root():
    return {"message": "Stock-Pics API v1.0"}

@app.post("/api/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@app.get("/api/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks

# ---------------- GOOGLE AUTH ----------------
@app.post("/api/auth/google")
async def google_auth(data: GoogleAuthRequest):
    try:
        payload = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = {
        "google_id": payload["sub"],
        "email": payload["email"],
        "name": payload.get("name"),
        "avatar": payload.get("picture"),
        "created_at": datetime.now(timezone.utc),
    }

    await db.users.update_one(
        {"google_id": user["google_id"]},
        {"$setOnInsert": user},
        upsert=True,
    )

    token = jwt.encode(
        {
            "sub": user["google_id"],
            "email": user["email"],
            "exp": datetime.utcnow().timestamp() + 60 * 60 * 24,
        },
        JWT_SECRET,
        algorithm="HS256",
    )

    return {"token": token, "user": user}

logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()