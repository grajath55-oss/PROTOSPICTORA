from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from server import db
from passlib.context import CryptContext
from datetime import datetime
import jwt
import os

router = APIRouter(prefix="/api/auth")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

# 🔐 CHANGE THIS EMAIL TO YOURS (FIRST ADMIN)
INITIAL_ADMIN_EMAIL = "yashtheadmin@gmail.com"

# -------- MODELS --------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# -------- HELPERS --------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_token(user_id: str, email: str, role: str):
    return jwt.encode(
        {
            "sub": user_id,
            "email": email,
            "role": role,
        },
        JWT_SECRET,
        algorithm="HS256",
    )

# -------- ROUTES --------
@router.post("/register")
async def register(data: RegisterRequest):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    role = "admin" if data.email == INITIAL_ADMIN_EMAIL else "user"

    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": role,  # ✅ ROLE ADDED
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user)

    token = create_token(str(result.inserted_id), data.email, role)

    return {
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": user["name"],
            "email": user["email"],
            "role": role,
        },
    }

@router.post("/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    role = user.get("role", "user")  # backward-compatible

    token = create_token(str(user["_id"]), user["email"], role)
    
    return {
  "token": token,
  "user": {
    "id": str(user["_id"]),
    "name": user["name"],
    "email": user["email"],
    "role": user.get("role", "user")
  }
}

