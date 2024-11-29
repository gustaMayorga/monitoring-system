# backend/app/models/event.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    type = Column(String)  # 'alarm', 'camera', 'system'
    severity = Column(String)  # 'info', 'warning', 'error'
    description = Column(String)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="events")
