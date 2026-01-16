import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Mock data
mock_images = [
    {
        'title': 'Diverse Fitness Group',
        'url': 'https://images.pexels.com/photos/34712226/pexels-photo-34712226.jpeg',
        'category': 'lifestyle',
        'tags': ['fitness', 'people', 'sport', 'diverse', 'health'],
        'photographer_id': 'p1',
        'photographer_name': 'Sarah Johnson',
        'photographer_avatar': 'https://i.pravatar.cc/150?img=1',
        'price': 29.99,
        'downloads': 1247,
        'likes': 892,
        'orientation': 'landscape',
        'colors': ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        'uploaded_at': datetime.utcnow(),
        'is_admin_upload': False,
        'description': 'Diverse group of people exercising together outdoors',
        'file_url': 'https://images.pexels.com/photos/34712226/pexels-photo-34712226.jpeg',
        'thumbnail_url': 'https://images.pexels.com/photos/34712226/pexels-photo-34712226.jpeg'
    },
    {
        'title': 'Social Gathering',
        'url': 'https://images.pexels.com/photos/6224641/pexels-photo-6224641.jpeg',
        'category': 'lifestyle',
        'tags': ['people', 'social', 'friends', 'gathering', 'lifestyle'],
        'photographer_id': 'p2',
        'photographer_name': 'Michael Chen',
        'photographer_avatar': 'https://i.pravatar.cc/150?img=2',
        'price': 34.99,
        'downloads': 2341,
        'likes': 1567,
        'orientation': 'landscape',
        'colors': ['#2C3E50', '#E74C3C', '#ECF0F1'],
        'uploaded_at': datetime.utcnow(),
        'is_admin_upload': False,
        'description': 'Friends gathering and socializing',
        'file_url': 'https://images.pexels.com/photos/6224641/pexels-photo-6224641.jpeg',
        'thumbnail_url': 'https://images.pexels.com/photos/6224641/pexels-photo-6224641.jpeg'
    },
    {
        'title': 'Business Handshake',
        'url': 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg',
        'category': 'business',
        'tags': ['business', 'handshake', 'corporate', 'teamwork', 'professional'],
        'photographer_id': 'p3',
        'photographer_name': 'Emma Wilson',
        'photographer_avatar': 'https://i.pravatar.cc/150?img=3',
        'price': 39.99,
        'downloads': 3456,
        'likes': 2134,
        'orientation': 'landscape',
        'colors': ['#34495E', '#95A5A6', '#ECF0F1'],
        'uploaded_at': datetime.utcnow(),
        'is_admin_upload': False,
        'description': 'Professional business handshake',
        'file_url': 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg',
        'thumbnail_url': 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg'
    },
    {
        'title': 'City Skyline',
        'url': 'https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg',
        'category': 'business',
        'tags': ['city', 'skyline', 'urban', 'architecture', 'corporate'],
        'photographer_id': 'p1',
        'photographer_name': 'Sarah Johnson',
        'photographer_avatar': 'https://i.pravatar.cc/150?img=1',
        'price': 44.99,
        'downloads': 4567,
        'likes': 3421,
        'orientation': 'landscape',
        'colors': ['#1A1A2E', '#16213E', '#0F3460'],
        'uploaded_at': datetime.utcnow(),
        'is_admin_upload': False,
        'description': 'Modern city skyline at dusk',
        'file_url': 'https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg',
        'thumbnail_url': 'https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg'
    },
    {
        'title': 'Coding Screen',
        'url': 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
        'category': 'technology',
        'tags': ['coding', 'programming', 'technology', 'developer', 'software'],
        'photographer_id': 'p4',
        'photographer_name': 'David Park',
        'photographer_avatar': 'https://i.pravatar.cc/150?img=4',
        'price': 24.99,
        'downloads': 5678,
        'likes': 4321,
        'orientation': 'landscape',
        'colors': ['#0D1117', '#58A6FF', '#21262D'],
        'uploaded_at': datetime.utcnow(),
        'is_admin_upload': False,
        'description': 'Close-up of programming code on screen',
        'file_url': 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
        'thumbnail_url': 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg'
    }
]

mock_user = {
    '_id': 'user1',
    'name': 'John Doe',
    'email': 'john@example.com',
    'avatar': 'https://i.pravatar.cc/150?img=10',
    'role': 'both',
    'balance': 2500.0,
    'total_earnings': 5678.90,
    'total_spent': 1234.50,
    'uploads_count': 45,
    'purchases_count': 78,
    'favorites': [],
    'created_at': datetime.utcnow()
}

async def seed_database():
    print("Seeding database...")
    
    # Clear existing data
    await db.images.delete_many({})
    await db.users.delete_many({})
    
    # Insert user
    await db.users.insert_one(mock_user)
    print(f"✅ Inserted user: {mock_user['name']}")
    
    # Insert images
    result = await db.images.insert_many(mock_images)
    print(f"✅ Inserted {len(result.inserted_ids)} images")
    
    print("✅ Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
