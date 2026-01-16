from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from bson import ObjectId

from server import db
from routes.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["purchases"])

# ---------- MODELS ----------
class PurchaseCreate(BaseModel):
    image_ids: List[str]
    total_amount: float


# ---------- CREATE PURCHASE ----------
@router.post("/purchases")
async def create_purchase(
    data: PurchaseCreate,
    user=Depends(get_current_user)
):
    try:
        purchase_doc = {
            "user_id": str(user["_id"]),
            "image_ids": [ObjectId(i) for i in data.image_ids],
            "total_amount": data.total_amount,
            "created_at": datetime.utcnow(),
        }

        result = await db.purchases.insert_one(purchase_doc)

        for img_id in purchase_doc["image_ids"]:
            await db.images.update_one(
                {"_id": img_id},
                {"$inc": {"downloads": 1}}
            )

        purchase_doc["_id"] = str(result.inserted_id)
        purchase_doc["image_ids"] = [str(i) for i in purchase_doc["image_ids"]]

        return purchase_doc

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- GET MY PURCHASES ----------
@router.get("/purchases")
async def get_my_purchases(user=Depends(get_current_user)):
    purchases = await db.purchases.find(
        {"user_id": str(user["_id"])}
    ).to_list(100)

    for p in purchases:
        p["_id"] = str(p["_id"])
        p["image_ids"] = [str(i) for i in p.get("image_ids", [])]

    return purchases


# ---------- AUTO CHECK: HAS PURCHASED IMAGE ----------
@router.get("/purchases/has-image/{image_id}")
async def has_purchased_image(
    image_id: str,
    user=Depends(get_current_user)
):
    if not ObjectId.is_valid(image_id):
        return {"purchased": False}

    purchase = await db.purchases.find_one({
        "user_id": str(user["_id"]),
        "image_ids": ObjectId(image_id)
    })

    return {"purchased": bool(purchase)}


# ---------- (OPTIONAL) ADMIN / LEGACY ----------
@router.get("/purchases/by-user/{user_id}")
async def get_purchases_by_user(user_id: str):
    purchases = await db.purchases.find(
        {"user_id": user_id}
    ).to_list(100)

    for p in purchases:
        p["_id"] = str(p["_id"])
        p["image_ids"] = [str(i) for i in p.get("image_ids", [])]

    return purchases
