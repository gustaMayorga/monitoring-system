# backend/app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String)

# backend/app/models/device.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # "camera" or "alarm"
    status = Column(String)
    ip_address = Column(String)
    location = Column(String)
    is_active = Column(Boolean, default=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    
    client = relationship("Client", back_populates="devices")
    events = relationship("Event", back_populates="device")