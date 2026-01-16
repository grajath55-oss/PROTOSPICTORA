from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Depends
from typing import Optional
from datetime import datetime
from bson import ObjectId
import os
import httpx
import requests

import cloudinary
import cloudinary.uploader
import cloudinary.api

from models import (
    ImageResponse,
    PurchaseCreate, PurchaseResponse,
    FavoriteCreate,
    BulkRecommendRequest
)

from server import db, get_current_user

router = APIRouter(prefix="/api", tags=["api"])

# ==================== CONFIG ====================

CURRENT_USER_ID = ObjectId("65f000000000000000000001")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ==================== IMAGES ====================

@router.get("/images", response_model=ImageResponse)
async def get_images(
    category: Optional[str] = None,
    search: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    orientation: Optional[str] = None,
    sort_by: str = "popular",
    skip: int = 0,
    limit: int = 100
):
    query = {}

    if category and category != "all":
        query["category"] = category

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    if price_min is not None or price_max is not None:
        query["price"] = {}
        if price_min is not None:
            query["price"]["$gte"] = price_min
        if price_max is not None:
            query["price"]["$lte"] = price_max

    if orientation and orientation != "all":
        query["orientation"] = orientation

    sort_field = "downloads" if sort_by == "popular" else "uploaded_at"
    sort_order = -1
    if sort_by == "price-low":
        sort_field = "price"
        sort_order = 1
    elif sort_by == "price-high":
        sort_field = "price"
        sort_order = -1

    total = await db.images.count_documents(query)
    images = await (
        db.images.find(query)
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    for img in images:
        img["_id"] = str(img["_id"])
        # Show watermarked version for non-purchased images
        if img.get("preview_url"):
            img["file_url"] = img["preview_url"]

    return {"images": images, "total": total}


@router.post("/images")
async def upload_image(
    title: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    orientation: str = Form("landscape"),
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        # Upload original without watermark
        uploaded = cloudinary.uploader.upload(
            file.file,
            folder="STOCKPICS/originals",
            resource_type="image"
        )
        
        # Get public ID for the original
        original_public_id = uploaded["public_id"]
        
        # Create watermarked version using transformation
        watermarked_url = cloudinary.utils.cloudinary_url(
            original_public_id,
            transformation=[
                {"overlay": {"font_family": "Arial", "font_size": 60, "text": "STOCKPICS"}},
                {"color": "#FFFFFF", "opacity": 50},
                {"flags": "layer_apply", "gravity": "north_east", "x": 30, "y": 30}
            ]
        )[0]
        
    except Exception as e:
        print("CLOUDINARY ERROR:", e)
        raise HTTPException(status_code=500, detail="Cloudinary upload failed")

    user = await db.users.find_one({"_id": CURRENT_USER_ID})
    if not user:
        user = {
            "_id": CURRENT_USER_ID,
            "name": "John Doe",
            "email": "john@example.com",
            "uploads_count": 0,
            "created_at": datetime.utcnow(),
        }
        await db.users.insert_one(user)

    image_doc = {
        "title": title,
        "description": description,
        "file_url": uploaded["secure_url"],  # Original without watermark
        "preview_url": watermarked_url,  # Watermarked version
        "public_id": original_public_id,  # Store Cloudinary public ID for original
        "photographer_id": str(CURRENT_USER_ID),
        "photographer_name": user["name"],
        "category": category,
        "tags": [t.strip() for t in tags.split(",") if t.strip()],
        "price": float(price),
        "orientation": orientation,
        "downloads": 0,
        "likes": 0,
        "uploaded_at": datetime.utcnow(),
    }

    result = await db.images.insert_one(image_doc)

    await db.users.update_one(
        {"_id": CURRENT_USER_ID},
        {"$inc": {"uploads_count": 1}},
    )

    image_doc["_id"] = str(result.inserted_id)
    return image_doc


# ==================== PURCHASES ====================

@router.post("/purchases", response_model=PurchaseResponse)
async def create_purchase(purchase: PurchaseCreate):
    purchase_data = purchase.dict()
    purchase_data["purchased_at"] = datetime.utcnow()

    result = await db.purchases.insert_one(purchase_data)

    for image_id in purchase.image_ids:
        if ObjectId.is_valid(image_id):
            await db.images.update_one(
                {"_id": ObjectId(image_id)},
                {"$inc": {"downloads": 1}},
            )

    purchase_data["_id"] = str(result.inserted_id)
    return {"purchase": purchase_data, "message": "Purchase successful"}


# ==================== BULK RECOMMEND ====================

@router.post("/bulk-recommend")
async def bulk_recommend(request: BulkRecommendRequest):
    keywords = request.requirements.lower().split()

    query = {
        "$or": [
            {"tags": {"$in": keywords}},
            {"category": {"$in": keywords}},
            {"title": {"$regex": "|".join(keywords), "$options": "i"}},
        ]
    }

    images = await db.images.find(query).limit(100).to_list(100)
    for img in images:
        img["_id"] = str(img["_id"])
        if img.get("preview_url"):
            img["file_url"] = img["preview_url"]

    return {"images": images[:20], "total": len(images)}


# ==================== FAVORITES ====================

@router.post("/favorites")
async def add_favorite(favorite: FavoriteCreate):
    await db.favorites.update_one(
        {"user_id": favorite.user_id, "image_id": favorite.image_id},
        {"$setOnInsert": {"added_at": datetime.utcnow()}},
        upsert=True,
    )
    await db.images.update_one(
        {"_id": ObjectId(favorite.image_id)},
        {"$inc": {"likes": 1}},
    )
    return {"message": "Added to favorites"}


@router.get("/favorites")
async def get_favorites(user_id: str = Query(...)):
    favs = await db.favorites.find({"user_id": user_id}).to_list(1000)
    image_ids = [ObjectId(f["image_id"]) for f in favs if ObjectId.is_valid(f["image_id"])]

    images = await db.images.find({"_id": {"$in": image_ids}}).to_list(1000)
    for img in images:
        img["_id"] = str(img["_id"])
        if img.get("preview_url"):
            img["file_url"] = img["preview_url"]

    return {"images": images, "total": len(images)}

# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_dashboard():
    user = await db.users.find_one({"_id": CURRENT_USER_ID})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    uploads = await db.images.find(
        {"photographer_id": str(CURRENT_USER_ID)}
    ).to_list(100)

    purchases = await db.purchases.find(
        {"user_id": str(CURRENT_USER_ID)}
    ).to_list(100)

    total_earnings = sum(
        img.get("price", 0) * img.get("downloads", 0) for img in uploads
    )

    total_spent = sum(p.get("total_amount", 0) for p in purchases)

    for img in uploads:
        img["_id"] = str(img["_id"])
        if img.get("preview_url"):
            img["file_url"] = img["preview_url"]

    for p in purchases:
        p["_id"] = str(p["_id"])

    return {
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "avatar": user.get("avatar"),
            "role": "both",
            "uploads": len(uploads),
            "purchases": len(purchases),
            "totalEarnings": total_earnings,
            "totalSpent": total_spent,
            "balance": total_earnings - total_spent,
        },
        "uploads": uploads,
        "purchases": purchases,
    }

# ==================== DOWNLOAD ====================

@router.get("/download/{image_id}")
async def download_image(image_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user has purchased this image
    purchase = await db.purchases.find_one({
        "user_id": current_user["google_id"],
        "image_ids": image_id
    })

    if not purchase:
        raise HTTPException(status_code=403, detail="Not purchased")

    # Get image data
    image = await db.images.find_one({"_id": ObjectId(image_id)})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Get original image from Cloudinary (no watermark)
    try:
        # Get signed download URL for original image
        original_url = cloudinary.utils.cloudinary_url(
            image["public_id"],
            resource_type="image",
            attachment=True,
            flags="attachment",
            sign_url=True
        )[0]
        
        # Fetch the image content
        response = requests.get(original_url)
        if response.status_code != 200:
            raise Exception("Failed to fetch image from Cloudinary")
            
        # Return the image with proper headers for download
        from fastapi.responses import StreamingResponse
        from io import BytesIO
        
        filename = f"{image['title'].replace(' ', '_')}_{image_id}.jpg"
        
        return StreamingResponse(
            BytesIO(response.content),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "image/jpeg"
            }
        )
        
    except Exception as e:
        print("Cloudinary download error:", e)
        # Fallback: return the original URL
        return {"url": image["file_url"]}