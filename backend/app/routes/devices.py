# backend/app/routes/devices.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.device_service import DeviceService
from ..schemas.device import Device, DeviceCreate, DeviceUpdate

router = APIRouter()

@router.get("/devices", response_model=list[Device])
def get_devices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    devices = DeviceService.get_devices(db, skip=skip, limit=limit)
    return devices

@router.post("/devices", response_model=Device)
def create_device(
    device: DeviceCreate,
    db: Session = Depends(get_db)
):
    return DeviceService.create_device(db, device)