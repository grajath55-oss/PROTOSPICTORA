from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
from pathlib import Path
from datetime import datetime
from bson import ObjectId
import uuid

from server import db
from PIL import Image, ImageDraw, ImageFont
from routes.dependencies import get_current_user

router = APIRouter(prefix="/api")

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ---------- WATERMARK ----------
def add_watermark(image_path: Path, text="STOCKPICS"):
    base = Image.open(image_path).convert("RGBA")
    watermark = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark)

    try:
        font = ImageFont.truetype("arial.ttf", 165)
    except:
        font = ImageFont.load_default()

    w, h = base.size
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (w - (bbox[2] - bbox[0])) // 2
    y = (h - (bbox[3] - bbox[1])) // 2

    for dx in range(-2, 3):
        for dy in range(-2, 3):
            draw.text((x+dx, y+dy), text, font=font, fill=(0, 0, 0, 130))

    Image.alpha_composite(base, watermark).convert("RGB").save(image_path)

# ---------- GET IMAGES ----------
@router.get("/images")
async def get_images(skip: int = 0, limit: int = 100):
    images = await db.images.find().skip(skip).limit(limit).to_list(limit)

    for img in images:
        img["_id"] = str(img["_id"])
        photographer = await db.users.find_one(
            {"_id": ObjectId(img["photographer_id"])}
        )
        img["photographer_name"] = photographer["name"] if photographer else "Unknown"

    total = await db.images.count_documents({})
    return {"images": images, "total": total}

# ---------- UPLOAD IMAGE ----------
@router.post("/images")
async def upload_image(
    title: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    orientation: str = Form("landscape"),
    user=Depends(get_current_user),
):
    filename = f"{uuid.uuid4()}.jpg"
    path = UPLOAD_DIR / filename

    with open(path, "wb") as f:
        f.write(await file.read())

    add_watermark(path)

    image = {
        "title": title,
        "description": description,
        "file_url": f"/uploads/{filename}",
        "thumbnail_url": f"/uploads/{filename}",
        "photographer_id": str(user["_id"]),
        "category": category,
        "tags": [t.strip() for t in tags.split(",") if t.strip()],
        "price": price,
        "orientation": orientation,
        "downloads": 0,
        "likes": 0,
        "uploaded_at": datetime.utcnow(),
    }

    result = await db.images.insert_one(image)
    image["_id"] = str(result.inserted_id)
    return image

# ---------- DASHBOARD ----------
@router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    uid = str(user["_id"])

    uploads = await db.images.find({"photographer_id": uid}).to_list(100)
    purchases = await db.purchases.find({"buyer_id": uid}).to_list(100)

    earnings = sum(i["price"] * i["downloads"] for i in uploads)
    spent = sum(p["total_amount"] for p in purchases)

    for i in uploads:
        i["_id"] = str(i["_id"])
    for p in purchases:
        p["_id"] = str(p["_id"])

    return {
        "user": {
            "id": uid,
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar"),
            "uploads": len(uploads),
            "purchases": len(purchases),
            "totalEarnings": earnings,
            "totalSpent": spent,
            "balance": earnings - spent,
        },
        "uploads": uploads,
        "purchases": purchases,
    }

# ---------- DOWNLOAD ORIGINAL (NO WATERMARK) ----------
@router.get("/download/{image_id}")
async def download_original_image(
    image_id: str,
    user=Depends(get_current_user)
):
    if not ObjectId.is_valid(image_id):
        raise HTTPException(status_code=400, detail="Invalid image id")

    purchase = await db.purchases.find_one({
        "user_id": str(user["_id"]),
        "image_ids": ObjectId(image_id)
    })

    if not purchase:
        raise HTTPException(status_code=403, detail="Image not purchased")

    image = await db.images.find_one({"_id": ObjectId(image_id)})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    return {"url": image["file_url"]}
