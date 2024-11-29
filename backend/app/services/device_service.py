# backend/app/services/device_service.py
from sqlalchemy.orm import Session
from ..models.device import Device
from ..schemas.device import DeviceCreate, DeviceUpdate

class DeviceService:
    @staticmethod
    def get_devices(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Device).offset(skip).limit(limit).all()

    @staticmethod
    def create_device(db: Session, device: DeviceCreate):
        db_device = Device(**device.dict())
        db.add(db_device)
        db.commit()
        db.refresh(db_device)
        return db_device

    @staticmethod
    def update_device(db: Session, device_id: int, device: DeviceUpdate):
        db_device = db.query(Device).filter(Device.id == device_id).first()
        if db_device:
            for key, value in device.dict(exclude_unset=True).items():
                setattr(db_device, key, value)
            db.commit()
            db.refresh(db_device)
        return db_device