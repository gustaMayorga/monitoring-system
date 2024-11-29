from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.client import Client

router = APIRouter()

@router.get("/clients")
def get_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()

@router.post("/clients")
def create_client(client: dict, db: Session = Depends(get_db)):
    db_client = Client(**client)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client