# backend/app/routes/test.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_connection():
    return {"message": "Connection successful"}