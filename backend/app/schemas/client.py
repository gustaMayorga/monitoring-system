from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClientBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True