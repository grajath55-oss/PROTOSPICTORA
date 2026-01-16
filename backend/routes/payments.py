import stripe
import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime
from bson import ObjectId

from server import db
from routes.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["payments"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# ---------- MODELS ----------
class PaymentIntentRequest(BaseModel):
    amount: int              # ✅ ALREADY IN CENTS
    image_ids: List[str]


# ---------- CREATE PAYMENT INTENT ----------
@router.post("/create-payment-intent")
async def create_payment_intent(
    data: PaymentIntentRequest,
    user=Depends(get_current_user)
):
    try:
        intent = stripe.PaymentIntent.create(
         amount=int(data.amount)
,  # ✅ NO MULTIPLY HERE
            currency="usd",
            automatic_payment_methods={"enabled": True},
            metadata={
                "user_id": str(user["_id"]),
                "image_ids": ",".join(data.image_ids),
            },
        )

        return {"clientSecret": intent.client_secret}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- CONFIRM PAYMENT & SAVE PURCHASE ----------
@router.post("/confirm-payment")
async def confirm_payment(
    payment_intent_id: str,
    user=Depends(get_current_user),
):
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status != "succeeded":
            raise HTTPException(status_code=400, detail="Payment not successful")

        image_ids = intent.metadata.get("image_ids", "").split(",")
        amount = intent.amount / 100

        purchase_doc = {
            "user_id": str(user["_id"]),
            "image_ids": [ObjectId(i) for i in image_ids if ObjectId.is_valid(i)],
            "total_amount": amount,
            "created_at": datetime.utcnow(),
        }

        await db.purchases.insert_one(purchase_doc)

        # increment downloads
        for img_id in purchase_doc["image_ids"]:
            await db.images.update_one(
                {"_id": img_id},
                {"$inc": {"downloads": 1}},
            )

        return {"message": "Purchase saved"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
