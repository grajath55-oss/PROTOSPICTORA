from fastapi import Header, HTTPException, Depends, Query
import jwt
import os
from server import db

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")

# ---------------- GET CURRENT USER ----------------
async def get_current_user(
    authorization: str | None = Header(default=None),
    token: str | None = Query(default=None)
):
    jwt_token = None

    # 1️⃣ From Authorization header
    if authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ", 1)[1]

    # 2️⃣ From query param (fallback for downloads)
    elif token:
        jwt_token = token

    if not jwt_token:
        raise HTTPException(status_code=401, detail="Missing Authorization token")

    try:
        payload = jwt.decode(jwt_token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"email": payload.get("email")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ---------------- REQUIRE ADMIN ----------------
async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user
