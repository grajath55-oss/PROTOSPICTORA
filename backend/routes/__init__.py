from fastapi import APIRouter

router = APIRouter()

from .payments import router as payments_router
from .stripe_webhook import router as webhook_router
from .images import router as images_router

router.include_router(payments_router)
router.include_router(webhook_router)
router.include_router(images_router)