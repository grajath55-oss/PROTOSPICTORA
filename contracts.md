# Stock-Pics API Contracts

## Overview
This document outlines the API contracts, data models, and integration plan for the stock-pics marketplace.

## Data Models

### User Model
```python
{
    id: ObjectId,
    email: str,
    name: str,
    password_hash: str,
    avatar: str (URL),
    role: str (photographer/buyer/both),
    balance: float,
    total_earnings: float,
    total_spent: float,
    uploads_count: int,
    purchases_count: int,
    favorites: [ObjectId],
    created_at: datetime
}
```

### Image Model
```python
{
    id: ObjectId,
    title: str,
    description: str,
    file_url: str,
    thumbnail_url: str,
    photographer_id: ObjectId,
    photographer_name: str,
    photographer_avatar: str,
    category: str,
    tags: [str],
    price: float,
    orientation: str (landscape/portrait/square),
    colors: [str],
    downloads: int,
    likes: int,
    uploaded_at: datetime,
    is_admin_upload: bool
}
```

### Purchase Model
```python
{
    id: ObjectId,
    buyer_id: ObjectId,
    image_ids: [ObjectId],
    total_amount: float,
    discount: float,
    is_bulk: bool,
    bulk_requirements: str (optional),
    purchased_at: datetime,
    stripe_payment_id: str
}
```

### Collection Model (Favorites)
```python
{
    id: ObjectId,
    user_id: ObjectId,
    image_id: ObjectId,
    added_at: datetime
}
```

## API Endpoints

### Authentication (Future - using mock for now)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Images
- GET /api/images - Get all images with filters (category, price_range, orientation, search)
- GET /api/images/:id - Get single image details
- POST /api/images - Upload new image (photographer only)
- PUT /api/images/:id - Update image details
- DELETE /api/images/:id - Delete image

### User/Dashboard
- GET /api/users/:id - Get user profile
- GET /api/users/:id/uploads - Get user's uploaded images
- GET /api/users/:id/purchases - Get user's purchase history
- PUT /api/users/:id - Update user profile

### Purchases
- POST /api/purchases - Create new purchase
- POST /api/purchases/bulk - Create bulk purchase with AI recommendations
- GET /api/purchases/:id - Get purchase details

### Favorites
- POST /api/favorites - Add to favorites
- DELETE /api/favorites/:imageId - Remove from favorites
- GET /api/favorites - Get user's favorites

### Search & Recommendations
- GET /api/search?q=:query - Search images
- POST /api/bulk-recommend - Get AI-powered bulk recommendations (smart filtering based on requirements)

### Stripe Integration (Future)
- POST /api/stripe/create-checkout - Create Stripe checkout session
- POST /api/stripe/webhook - Handle Stripe webhooks

## Mock Data Replacement Plan

### Frontend Changes:
1. Replace mockImages import with API calls to /api/images
2. Replace mockUser with API call to /api/auth/me
3. Replace mockPurchases with API call to /api/users/:id/purchases
4. Update all image actions (like, add to cart) to call backend APIs

### Backend Implementation Order:
1. Image endpoints (GET all, GET by ID)
2. User endpoints (GET profile, uploads, purchases)
3. Upload endpoint (POST image)
4. Purchase endpoints (regular & bulk)
5. Favorites endpoints
6. Search/filter functionality
7. Stripe integration (later)

## Notes
- For now, authentication is mocked (always returns logged-in user)
- File uploads will be stored in /app/backend/uploads directory
- AI recommendations use smart filtering algorithm based on keywords matching
- Stripe integration will be added but initially purchases are tracked in DB only
- Admin uploads default to $199 price
- Bulk purchases apply 20-25-30% discount based on quantity (500+/1000+/2000+)
