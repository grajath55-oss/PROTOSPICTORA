import stripe
import os
from fastapi import APIRouter, Request, HTTPException
from server import db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        metadata = intent.get("metadata", {})

        raw_ids = metadata.get("image_ids", "")
        image_ids = [
            ObjectId(i) for i in raw_ids.split(",")
            if i and ObjectId.is_valid(i)
        ]

        purchase_data = {
            "buyer_id": metadata.get("buyer_id", ""),
            "image_ids": image_ids,                 # ✅ ObjectId list
            "total_amount": intent["amount_received"] / 100,
            "stripe_payment_id": intent["id"],
            "purchased_at": datetime.utcnow(),
            "status": "completed",
        }

        await db.purchases.insert_one(purchase_data)

        # increment downloads
        for image_id in image_ids:
            await db.images.update_one(
                {"_id": image_id},
                {"$inc": {"downloads": 1}}
            )

    return {"status": "ok"}
