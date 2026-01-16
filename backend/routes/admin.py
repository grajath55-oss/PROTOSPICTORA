from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from zipfile import ZipFile
from pathlib import Path
from datetime import datetime
from bson import ObjectId
import uuid
import shutil

from server import db
from routes.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ==================== GET ALL IMAGES ====================
@router.get("/images")
async def admin_get_images(admin=Depends(require_admin)):
    images = await db.images.find().to_list(5000)
    for img in images:
        img["_id"] = str(img["_id"])
    return images


# ==================== DELETE IMAGE ====================
@router.delete("/images/{image_id}")
async def admin_delete_image(
    image_id: str,
    admin=Depends(require_admin),
):
    image = await db.images.find_one({"_id": ObjectId(image_id)})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    file_path = image.get("file_url") or image.get("image_url")
    if file_path:
        full_path = Path(file_path.lstrip("/"))
        if full_path.exists():
            try:
                full_path.unlink()
            except:
                pass

    await db.images.delete_one({"_id": ObjectId(image_id)})
    return {"message": "Image deleted"}


# ==================== SINGLE IMAGE UPLOAD (ADMIN) ====================
@router.post("/images/upload")
async def admin_upload_image(
    file: UploadFile = File(...),
    admin=Depends(require_admin),
):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid image type")

    filename = f"{uuid.uuid4()}{Path(file.filename).suffix.lower()}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        f.write(await file.read())

    image_doc = {
        "title": Path(file.filename).stem,
        "description": "Uploaded by admin",
        "file_url": f"/uploads/{filename}",
        "thumbnail_url": f"/uploads/{filename}",
        "photographer_id": "ADMIN",
        "category": "admin",
        "tags": ["admin"],
        "price": 0,
        "orientation": "landscape",
        "downloads": 0,
        "likes": 0,
        "uploaded_at": datetime.utcnow(),
    }

    await db.images.insert_one(image_doc)
    return {"message": "Image uploaded"}


# ==================== BULK ZIP UPLOAD ====================
@router.post("/images/bulk")
async def admin_bulk_upload(
    zip_file: UploadFile = File(...),
    admin=Depends(require_admin),
):
    if not zip_file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files allowed")

    zip_id = uuid.uuid4().hex
    zip_path = UPLOAD_DIR / f"{zip_id}.zip"
    extract_dir = UPLOAD_DIR / zip_id
    extract_dir.mkdir(exist_ok=True)

    with open(zip_path, "wb") as f:
        f.write(await zip_file.read())

    count = 0

    with ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_dir)

    for img_path in extract_dir.rglob("*"):
        if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            continue

        new_name = f"{uuid.uuid4()}{img_path.suffix.lower()}"
        final_path = UPLOAD_DIR / new_name
        shutil.move(str(img_path), final_path)

        image_doc = {
            "title": img_path.stem,
            "description": "Bulk uploaded by admin",
            "file_url": f"/uploads/{new_name}",
            "thumbnail_url": f"/uploads/{new_name}",
            "photographer_id": "ADMIN",
            "category": "admin",
            "tags": ["admin", "bulk"],
            "price": 0,
            "orientation": "landscape",
            "downloads": 0,
            "likes": 0,
            "uploaded_at": datetime.utcnow(),
        }

        await db.images.insert_one(image_doc)
        count += 1

    try:
        zip_path.unlink()
        shutil.rmtree(extract_dir)
    except:
        pass

    return {
        "message": "Bulk upload completed",
        "uploaded": count,
    }


# ==================== ADMIN ANALYTICS ====================
@router.get("/analytics")
async def admin_analytics(admin=Depends(require_admin)):
    total_images = await db.images.count_documents({})
    total_users = await db.users.count_documents({})

    images = await db.images.find().to_list(5000)
    total_downloads = sum(img.get("downloads", 0) for img in images)
    total_revenue = sum(
        img.get("downloads", 0) * img.get("price", 0) for img in images
    )

    return {
        "totalImages": total_images,
        "totalUsers": total_users,
        "totalDownloads": total_downloads,
        "totalRevenue": total_revenue,
    }
