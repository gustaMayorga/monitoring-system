from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las origins en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo simple
class Client(BaseModel):
    id: int | None = None
    name: str
    email: str

# Datos de prueba
CLIENTS = [
    {"id": 1, "name": "Cliente 1", "email": "cliente1@test.com"},
    {"id": 2, "name": "Cliente 2", "email": "cliente2@test.com"}
]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/clients", response_model=List[Client])
def get_clients():
    return CLIENTS

@app.post("/api/clients", response_model=Client)
def create_client(client: Client):
    new_client = client.model_dump()
    new_client["id"] = len(CLIENTS) + 1
    CLIENTS.append(new_client)
    return new_client