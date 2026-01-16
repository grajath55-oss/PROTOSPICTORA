from fastapi import APIRouter, Depends
from routes.dependencies import get_current_user

router = APIRouter(prefix="/api")

@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
    }
