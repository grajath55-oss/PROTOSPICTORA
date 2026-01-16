import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def seed_images():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["stockpics_db"]
    
    test_images = [
        {
            "title": "Mountain Landscape",
            "description": "Beautiful mountain view at sunrise",
            "file_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            "photographer_id": "65f000000000000000000001",
            "photographer_name": "John Doe",
            "category": "nature",
            "tags": ["mountain", "landscape", "sunrise"],
            "price": 29.99,
            "orientation": "landscape",
            "downloads": 42,
            "likes": 15,
            "uploaded_at": datetime.utcnow()
        },
        {
            "title": "City Skyline",
            "description": "Modern city skyline at night",
            "file_url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
            "thumbnail_url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
            "photographer_id": "65f000000000000000000001",
            "photographer_name": "John Doe",
            "category": "urban",
            "tags": ["city", "skyline", "night"],
            "price": 39.99,
            "orientation": "landscape",
            "downloads": 28,
            "likes": 9,
            "uploaded_at": datetime.utcnow()
        },
        {
            "title": "Beach Sunset",
            "description": "Golden hour at the beach",
            "file_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            "thumbnail_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            "photographer_id": "65f000000000000000000001",
            "photographer_name": "John Doe",
            "category": "nature",
            "tags": ["beach", "sunset", "ocean"],
            "price": 24.99,
            "orientation": "landscape",
            "downloads": 56,
            "likes": 23,
            "uploaded_at": datetime.utcnow()
        }
    ]
    
    # Clear existing images
    await db.images.delete_many({})
    
    # Insert test images
    result = await db.images.insert_many(test_images)
    print(f"✅ Inserted {len(result.inserted_ids)} test images")
    
    # Verify
    count = await db.images.count_documents({})
    print(f"📊 Total images in database: {count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_images())