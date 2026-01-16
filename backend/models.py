from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar: Optional[str] = None
    role: str = "both"  # photographer, buyer, both

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    balance: float = 0.0
    total_earnings: float = 0.0
    total_spent: float = 0.0
    uploads_count: int = 0
    purchases_count: int = 0
    favorites: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Image Models
class ImageBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    tags: List[str] = []
    price: float
    orientation: str = "landscape"  # landscape, portrait, square

class ImageCreate(ImageBase):
    photographer_id: str
    photographer_name: str
    photographer_avatar: Optional[str] = None
    file_url: str  # Original image URL (no watermark)
    preview_url: Optional[str] = None  # Watermarked preview URL
    thumbnail_url: Optional[str] = None  # Small thumbnail
    public_id: Optional[str] = None  # Cloudinary public ID for original
    is_admin_upload: bool = False

class Image(ImageCreate):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    colors: List[str] = []
    downloads: int = 0
    likes: int = 0
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Purchase Models
class PurchaseCreate(BaseModel):
    buyer_id: str
    image_ids: List[str]
    total_amount: float
    discount: float = 0.0
    is_bulk: bool = False
    bulk_requirements: Optional[str] = None

class Purchase(PurchaseCreate):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    purchased_at: datetime = Field(default_factory=datetime.utcnow)
    stripe_payment_id: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Favorite Models
class FavoriteCreate(BaseModel):
    user_id: str
    image_id: str

class Favorite(FavoriteCreate):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    added_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Bulk Recommendation Request
class BulkRecommendRequest(BaseModel):
    requirements: str
    quantity: int = 1000
    budget: float = 30000.0

# Response Models
class ImageResponse(BaseModel):
    images: List[Image]
    total: int

class PurchaseResponse(BaseModel):
    purchase: Purchase
    message: str