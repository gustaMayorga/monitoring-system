import load_env  # Esto cargará las variables de entorno
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.auth.permissions import Permission, check_permission
from app.auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.config.database import get_db_connection
from app.core.config import settings
from pydantic import BaseModel, EmailStr, Field
import bcrypt
import psycopg2
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Configuración CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Middleware para logs
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"\n=== Nueva petición ===")
    logger.info(f"Method: {request.method}")
    logger.info(f"URL: {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Error en middleware: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

# Configuración DB directa para pruebas
DB_CONFIG = {
    'dbname': 'monitoring_db',
    'user': 'postgres',
    'password': 'veoveo77',
    'host': 'localhost',
    'port': '5432'
}

# Modelo para los datos de login
class LoginData(BaseModel):
    username: str
    password: str

# Modelos
class Client(BaseModel):
    name: str
    company: str
    tax_id: str  # CUIT
    phone: str
    address: str
    client_number: str
    registration_date: datetime = Field(default_factory=datetime.now)
    billing_type: str  # Tipo de facturación (A, B, C, etc)

class Device(BaseModel):
    name: str
    type: str
    status: str
    client_id: int

class Event(BaseModel):
    device_id: int
    type: str
    description: str
    status: str

class Alert(BaseModel):
    event_id: int
    level: str
    message: str
    status: str

class Role(BaseModel):
    name: str
    description: str
    permissions: list[str]

# Modelo para usuarios
class UserCreate(BaseModel):
    username: str
    password: str

# Modelo para clientes con validación
class ClienteCreate(BaseModel):
    nombre: str
    email: EmailStr  # Esto validará el formato del email
    telefono: str

# Modelos Pydantic para eventos
class EventBase(BaseModel):
    panel_id: int
    event_type: str
    raw_message: str
    code: str
    qualifier: Optional[str]
    event_code: Optional[str]
    partition: Optional[str]
    zone_user: Optional[str]
    priority: int = 3

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    timestamp: datetime
    processed: bool
    processed_by: Optional[int]
    processed_at: Optional[datetime]
    client_info: Optional[dict]

# Modelos Pydantic para paneles y zonas
class PanelBase(BaseModel):
    client_id: int
    account_number: str
    verification_code: str
    panel_type: str
    model: str
    phone_line1: Optional[str]
    phone_line2: Optional[str]
    ip_address: Optional[str]
    port: Optional[int]
    notes: Optional[str]

class ZoneBase(BaseModel):
    zone_number: int
    description: str
    zone_type: str
    bypass_allowed: bool = True

# Endpoints de Clientes
@app.get("/clients")
async def get_clients():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT * FROM clients 
            ORDER BY name
        """)
        clients = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(client) for client in clients]
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "error", "detail": str(e)}
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/clients")
async def create_client(client: Client):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Generar número de cliente si no existe
        if not client.client_number:
            prefix = 'CLT'
            cur.execute("SELECT COUNT(*) FROM clients")
            count = cur.fetchone()[0]
            client.client_number = f"{prefix}-{count + 1:05d}"
        
        cur.execute("""
            INSERT INTO clients (
                name, company, tax_id, phone, address, 
                client_number, registration_date, billing_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            client.name, client.company, client.tax_id, 
            client.phone, client.address, client.client_number,
            datetime.now(timezone.utc), client.billing_type
        ))
        
        new_client = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(new_client)
        }
        
    except psycopg2.errors.UniqueViolation:
        return {
            "status": "error",
            "detail": "Ya existe un cliente con ese CUIT o número de cliente"
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "error", "detail": str(e)}
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.put("/clients/{client_id}")
async def update_client(client_id: int, client: Client):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            UPDATE clients 
            SET name = %s, company = %s, tax_id = %s, 
                phone = %s, address = %s, billing_type = %s
            WHERE id = %s
            RETURNING *
        """, (
            client.name, client.company, client.tax_id,
            client.phone, client.address, client.billing_type,
            client_id
        ))
        
        updated_client = cur.fetchone()
        
        if not updated_client:
            return {
                "status": "error",
                "detail": "Cliente no encontrado"
            }
            
        conn.commit()
        return {
            "status": "success",
            "data": dict(updated_client)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "error", "detail": str(e)}
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.delete("/clients/{client_id}")
async def delete_client(client_id: int):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        cur.execute("DELETE FROM clients WHERE id = %s RETURNING id", (client_id,))
        deleted = cur.fetchone()
        
        if not deleted:
            return {
                "status": "error",
                "detail": "Cliente no encontrado"
            }
            
        conn.commit()
        return {
            "status": "success",
            "message": "Cliente eliminado exitosamente"
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "error", "detail": str(e)}
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/health")
async def health_check():
    try:
        # Probar conexión a BD
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT 1')
        cur.close()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.options("/login")
async def login_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

# Endpoints de Roles y Usuarios
@app.get("/roles")
async def get_roles():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT id, name, description, permissions 
            FROM roles 
            ORDER BY name
        """)
        roles = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(role) for role in roles]
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "error", "detail": str(e)}
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Configuración de timeouts más largos
@app.middleware("http")
async def add_timeout_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Keep-Alive"] = "timeout=75"
    return response

async def get_total_clients():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM clients")
        total = cur.fetchone()[0]
        return total
    finally:
        cur.close()
        conn.close()

async def get_active_devices():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM devices WHERE status = 'active'")
        total = cur.fetchone()[0]
        return total
    except:
        return 0  # Si la tabla no existe aún
    finally:
        cur.close()
        conn.close()

async def get_pending_alerts():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM alerts WHERE status = 'pending'")
        total = cur.fetchone()[0]
        return total
    except:
        return 0  # Si la tabla no existe aún
    finally:
        cur.close()
        conn.close()

async def get_monthly_revenue():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT COALESCE(SUM(amount), 0)
            FROM invoices
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        """)
        total = cur.fetchone()[0]
        return float(total)
    except:
        return 0.0  # Si la tabla no existe aún
    finally:
        cur.close()
        conn.close()

@app.get("/dashboard/stats", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_dashboard_stats():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener estadísticas de forma segura
        try:
            cur.execute("""
                SELECT 
                    COALESCE((SELECT COUNT(*) FROM clients), 0) as total_clients,
                    COALESCE((SELECT COUNT(*) FROM alarm_panels WHERE last_connection > NOW() - INTERVAL '24 hours'), 0) as active_devices,
                    COALESCE((SELECT COUNT(*) FROM events WHERE processed = FALSE), 0) as pending_alerts,
                    COALESCE((SELECT COUNT(*) FROM events WHERE DATE(timestamp) = CURRENT_DATE), 0) as events_today
            """)
            
            stats = cur.fetchone()
            
            return {
                "status": "success",
                "data": {
                    "total_clients": int(stats['total_clients']),
                    "active_devices": int(stats['active_devices']),
                    "pending_alerts": int(stats['pending_alerts']),
                    "events_today": int(stats['events_today'])
                }
            }
            
        except psycopg2.Error as e:
            print(f"Error en consulta SQL: {e}")
            # Si hay error en las consultas, devolver valores por defecto
            return {
                "status": "success",
                "data": {
                    "total_clients": 0,
                    "active_devices": 0,
                    "pending_alerts": 0,
                    "events_today": 0
                }
            }
            
    except Exception as e:
        print(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para eventos
@app.get("/events/pending", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_pending_events():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener eventos pendientes con información del cliente
        cur.execute("""
            SELECT 
                e.*,
                c.name as client_name,
                c.company as client_company,
                c.address as client_address,
                c.phone as client_phone,
                ap.verification_code
            FROM events e
            JOIN alarm_panels ap ON e.panel_id = ap.id
            JOIN clients c ON ap.client_id = c.id
            WHERE e.processed = FALSE
            ORDER BY e.priority ASC, e.timestamp DESC
        """)
        
        events = cur.fetchall()
        
        # Formatear eventos
        formatted_events = []
        for event in events:
            event_dict = dict(event)
            event_dict['client_info'] = {
                'name': event_dict.pop('client_name'),
                'company': event_dict.pop('client_company'),
                'address': event_dict.pop('client_address'),
                'phone': event_dict.pop('client_phone'),
                'verification_code': event_dict.pop('verification_code')
            }
            formatted_events.append(event_dict)
        
        return {
            "status": "success",
            "data": formatted_events
        }
        
    except Exception as e:
        print(f"Error getting pending events: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/events/{event_id}/details", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_event_details(event_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener detalles del evento
        cur.execute("""
            SELECT 
                e.*,
                c.name as client_name,
                c.company as client_company,
                c.address as client_address,
                c.phone as client_phone,
                ap.verification_code,
                ap.panel_type,
                ap.model,
                pz.description as zone_description
            FROM events e
            JOIN alarm_panels ap ON e.panel_id = ap.id
            JOIN clients c ON ap.client_id = c.id
            LEFT JOIN panel_zones pz ON ap.id = pz.panel_id AND e.zone_user = CAST(pz.zone_number AS TEXT)
            WHERE e.id = %s
        """, (event_id,))
        
        event = cur.fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        # Obtener historial de acciones
        cur.execute("""
            SELECT 
                el.*,
                u.username as operator_name
            FROM event_logs el
            JOIN users u ON el.operator_id = u.id
            WHERE el.event_id = %s
            ORDER BY el.created_at DESC
        """, (event_id,))
        
        logs = cur.fetchall()
        
        # Formatear respuesta
        event_dict = dict(event)
        event_dict['client_info'] = {
            'name': event_dict.pop('client_name'),
            'company': event_dict.pop('client_company'),
            'address': event_dict.pop('client_address'),
            'phone': event_dict.pop('client_phone'),
            'verification_code': event_dict.pop('verification_code')
        }
        event_dict['panel_info'] = {
            'type': event_dict.pop('panel_type'),
            'model': event_dict.pop('model'),
            'zone_description': event_dict.pop('zone_description')
        }
        event_dict['logs'] = [dict(log) for log in logs]
        
        return {
            "status": "success",
            "data": event_dict
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error getting event details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/events/{event_id}/process", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def process_event(event_id: int, data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar que el evento existe y no está procesado
        cur.execute("""
            SELECT processed 
            FROM events 
            WHERE id = %s
        """, (event_id,))
        
        event = cur.fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        if event['processed']:
            raise HTTPException(status_code=400, detail="Evento ya procesado")
        
        # Registrar acción
        cur.execute("""
            INSERT INTO event_logs (
                event_id, operator_id, action, notes
            ) VALUES (%s, %s, %s, %s)
        """, (
            event_id,
            data['operator_id'],
            data['action'],
            data.get('notes', '')
        ))
        
        # Actualizar estado del evento
        cur.execute("""
            UPDATE events 
            SET processed = TRUE,
                processed_by = %s,
                processed_at = NOW()
            WHERE id = %s
        """, (data['operator_id'], event_id))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Evento procesado exitosamente"
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error processing event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/login")
async def login(login_data: LoginData):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT u.*, r.name as role_name, r.permissions 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.username = %s
        """, (login_data.username,))
        
        user = cur.fetchone()
        
        if not user:
            return JSONResponse(
                status_code=401,
                content={"status": "error", "detail": "Usuario o contraseña incorrectos"}
            )
        
        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user['password'].encode('utf-8')):
            return JSONResponse(
                status_code=401,
                content={"status": "error", "detail": "Usuario o contraseña incorrectos"}
            )
        
        # Actualizar last_login
        cur.execute("""
            UPDATE users 
            SET last_login = NOW() 
            WHERE id = %s
        """, (user['id'],))
        conn.commit()
        
        # Crear token de acceso
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user['id']),
                "username": user['username'],
                "role": user['role_name'],
                "permissions": user['permissions']
            },
            expires_delta=access_token_expires
        )
        
        return JSONResponse(
            content={
                "status": "success",
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user['id'],
                    "username": user['username'],
                    "role": user['role_name'],
                    "is_active": user['is_active'],
                    "permissions": user['permissions']
                }
            }
        )
        
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": str(e)}
        )
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Agregar endpoint para cambiar contraseña
@app.post("/change-password")
async def change_password(data: dict):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar usuario y contraseña actual
        cur.execute("""
            SELECT u.*, r.name as role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.username = %s
        """, (data['username'],))
        user = cur.fetchone()
        
        if not user:
            return {
                "status": "error",
                "detail": "Usuario no encontrado"
            }
        
        # Verificar contraseña actual
        if not bcrypt.checkpw(data['current_password'].encode('utf-8'), 
                            user['password'].encode('utf-8')):
            return {
                "status": "error",
                "detail": "Contraseña actual incorrecta"
            }
        
        # Actualizar contraseña
        hashed = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
        cur.execute("""
            UPDATE users 
            SET password = %s, must_change_password = FALSE 
            WHERE username = %s
            RETURNING id, username, role_id, is_active, must_change_password
        """, (hashed.decode('utf-8'), data['username']))
        
        updated_user = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "user": {
                "id": updated_user['id'],
                "username": updated_user['username'],
                "role": user['role_name'],
                "is_active": updated_user['is_active']
            },
            "message": "Contraseña actualizada exitosamente"
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "status": "error",
            "detail": f"Error interno del servidor: {str(e)}"
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/check-db")
async def check_db():
    try:
        conn = get_db_connection()
        # Realizar una consulta simple para verificar la conexión
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Conexión a la base de datos exitosa"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
async def root():
    return {"message": "API running"}

@app.get("/users", dependencies=[Depends(check_permission(Permission.USERS_READ))])
async def get_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT 
                u.id, 
                u.username, 
                u.is_active, 
                u.last_login,
                r.name as role,
                r.permissions
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.username
        """)
        users = cur.fetchall()
        
        formatted_users = []
        for user in users:
            user_dict = dict(user)
            if user_dict['last_login']:
                user_dict['last_login'] = user_dict['last_login'].isoformat()
            formatted_users.append(user_dict)
        
        return {
            "status": "success",
            "data": formatted_users
        }
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/users", dependencies=[Depends(check_permission(Permission.USERS_WRITE))])
async def create_user(user_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el usuario ya existe
        cur.execute("SELECT id FROM users WHERE username = %s", (user_data['username'],))
        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="El usuario ya existe"
            )
        
        # Obtener el role_id basado en el nombre del rol
        cur.execute("SELECT id FROM roles WHERE name = %s", (user_data['role'],))
        role = cur.fetchone()
        if not role:
            raise HTTPException(
                status_code=400,
                detail="Rol no válido"
            )
        
        hashed = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt())
        
        cur.execute("""
            INSERT INTO users (username, password, role_id, is_active)
            VALUES (%s, %s, %s, TRUE)
            RETURNING id, username, role_id, is_active
        """, (user_data['username'], hashed.decode('utf-8'), role['id']))
        
        new_user = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(new_user)
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.put("/users/{user_id}", dependencies=[Depends(check_permission(Permission.USERS_WRITE))])
async def update_user(user_id: int, user_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el usuario existe
        cur.execute("SELECT role_id FROM users WHERE id = %s", (user_id,))
        existing_user = cur.fetchone()
        if not existing_user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Si se está actualizando el rol
        if 'role' in user_data:
            cur.execute("SELECT id FROM roles WHERE name = %s", (user_data['role'],))
            role = cur.fetchone()
            if not role:
                raise HTTPException(status_code=400, detail="Rol no válido")
            user_data['role_id'] = role['id']
            del user_data['role']

        # Construir la consulta SQL dinámicamente
        update_fields = []
        values = []
        for key, value in user_data.items():
            if key not in ['password']:  # Excluir campos que no queremos actualizar directamente
                update_fields.append(f"{key} = %s")
                values.append(value)
        
        if update_fields:
            values.append(user_id)
            query = f"""
                UPDATE users 
                SET {", ".join(update_fields)}
                WHERE id = %s
                RETURNING id, username, role_id, is_active
            """
            cur.execute(query, values)
            updated_user = cur.fetchone()
            conn.commit()
            
            # Obtener el nombre del rol
            cur.execute("SELECT name FROM roles WHERE id = %s", (updated_user['role_id'],))
            role = cur.fetchone()
            
            return {
                "status": "success",
                "data": {
                    **dict(updated_user),
                    "role": role['name'] if role else None
                }
            }
        
        return {"status": "error", "detail": "No hay campos para actualizar"}
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.delete("/users/{user_id}", dependencies=[Depends(check_permission(Permission.ADMIN_ALL))])
async def delete_user(user_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verificar si el usuario existe
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Eliminar el usuario
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        
        return {
            "status": "success",
            "message": "Usuario eliminado exitosamente"
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para paneles de alarma
@app.get("/alarm-panels", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_alarm_panels():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        try:
            cur.execute("""
                SELECT 
                    ap.*,
                    c.name as client_name,
                    c.company as client_company
                FROM alarm_panels ap
                JOIN clients c ON ap.client_id = c.id
                ORDER BY c.name, ap.account_number
            """)
            
            panels = cur.fetchall()
            return {
                "status": "success",
                "data": [dict(panel) for panel in panels]
            }
            
        except psycopg2.Error as e:
            print(f"Error en consulta SQL: {e}")
            return {
                "status": "success",
                "data": []
            }
            
    except Exception as e:
        print(f"Error getting alarm panels: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/alarm-panels/{panel_id}", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_alarm_panel(panel_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT 
                ap.*,
                c.name as client_name,
                c.company as client_company
            FROM alarm_panels ap
            JOIN clients c ON ap.client_id = c.id
            WHERE ap.id = %s
        """, (panel_id,))
        
        panel = cur.fetchone()
        if not panel:
            raise HTTPException(status_code=404, detail="Panel no encontrado")
            
        return {
            "status": "success",
            "data": dict(panel)
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error getting alarm panel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/alarm-panels", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def create_alarm_panel(panel: PanelBase):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el cliente existe
        cur.execute("SELECT id FROM clients WHERE id = %s", (panel.client_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        # Verificar si el número de cuenta ya existe
        cur.execute("SELECT id FROM alarm_panels WHERE account_number = %s", (panel.account_number,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Número de cuenta ya existe")
        
        cur.execute("""
            INSERT INTO alarm_panels (
                client_id, account_number, verification_code,
                panel_type, model, phone_line1, phone_line2,
                ip_address, port, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            panel.client_id, panel.account_number, panel.verification_code,
            panel.panel_type, panel.model, panel.phone_line1, panel.phone_line2,
            panel.ip_address, panel.port, panel.notes
        ))
        
        new_panel = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(new_panel)
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error creating alarm panel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.put("/alarm-panels/{panel_id}", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def update_alarm_panel(panel_id: int, panel: PanelBase):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el panel existe
        cur.execute("SELECT id FROM alarm_panels WHERE id = %s", (panel_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Panel no encontrado")
        
        # Verificar si el cliente existe
        cur.execute("SELECT id FROM clients WHERE id = %s", (panel.client_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        # Verificar si el número de cuenta ya existe (excluyendo el panel actual)
        cur.execute("""
            SELECT id FROM alarm_panels 
            WHERE account_number = %s AND id != %s
        """, (panel.account_number, panel_id))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Número de cuenta ya existe")
        
        cur.execute("""
            UPDATE alarm_panels SET
                client_id = %s,
                account_number = %s,
                verification_code = %s,
                panel_type = %s,
                model = %s,
                phone_line1 = %s,
                phone_line2 = %s,
                ip_address = %s,
                port = %s,
                notes = %s
            WHERE id = %s
            RETURNING *
        """, (
            panel.client_id, panel.account_number, panel.verification_code,
            panel.panel_type, panel.model, panel.phone_line1, panel.phone_line2,
            panel.ip_address, panel.port, panel.notes, panel_id
        ))
        
        updated_panel = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(updated_panel)
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error updating alarm panel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para zonas
@app.get("/alarm-panels/{panel_id}/zones", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_panel_zones(panel_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT * FROM panel_zones
            WHERE panel_id = %s
            ORDER BY zone_number
        """, (panel_id,))
        
        zones = cur.fetchall()
        return {
            "status": "success",
            "data": [dict(zone) for zone in zones]
        }
        
    except Exception as e:
        print(f"Error getting panel zones: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/alarm-panels/{panel_id}/zones", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def create_panel_zone(panel_id: int, zone: ZoneBase):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el panel existe
        cur.execute("SELECT id FROM alarm_panels WHERE id = %s", (panel_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Panel no encontrado")
        
        # Verificar si el número de zona ya existe para este panel
        cur.execute("""
            SELECT id FROM panel_zones 
            WHERE panel_id = %s AND zone_number = %s
        """, (panel_id, zone.zone_number))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Número de zona ya existe")
        
        cur.execute("""
            INSERT INTO panel_zones (
                panel_id, zone_number, description,
                zone_type, bypass_allowed
            ) VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """, (
            panel_id, zone.zone_number, zone.description,
            zone.zone_type, zone.bypass_allowed
        ))
        
        new_zone = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(new_zone)
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error creating panel zone: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.put("/alarm-panels/{panel_id}/zones/{zone_id}", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def update_panel_zone(panel_id: int, zone_id: int, zone: ZoneBase):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si la zona existe y pertenece al panel
        cur.execute("""
            SELECT id FROM panel_zones 
            WHERE id = %s AND panel_id = %s
        """, (zone_id, panel_id))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Zona no encontrada")
        
        # Verificar si el número de zona ya existe (excluyendo la zona actual)
        cur.execute("""
            SELECT id FROM panel_zones 
            WHERE panel_id = %s AND zone_number = %s AND id != %s
        """, (panel_id, zone.zone_number, zone_id))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Número de zona ya existe")
        
        cur.execute("""
            UPDATE panel_zones SET
                zone_number = %s,
                description = %s,
                zone_type = %s,
                bypass_allowed = %s
            WHERE id = %s AND panel_id = %s
            RETURNING *
        """, (
            zone.zone_number, zone.description,
            zone.zone_type, zone.bypass_allowed,
            zone_id, panel_id
        ))
        
        updated_zone = cur.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(updated_zone)
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error updating panel zone: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.delete("/alarm-panels/{panel_id}/zones/{zone_id}", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def delete_panel_zone(panel_id: int, zone_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verificar si la zona existe y pertenece al panel
        cur.execute("""
            SELECT id FROM panel_zones 
            WHERE id = %s AND panel_id = %s
        """, (zone_id, panel_id))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Zona no encontrada")
        
        # Eliminar la zona
        cur.execute("""
            DELETE FROM panel_zones 
            WHERE id = %s AND panel_id = %s
        """, (zone_id, panel_id))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Zona eliminada exitosamente"
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error deleting panel zone: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.delete("/alarm-panels/{panel_id}", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def delete_alarm_panel(panel_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verificar si el panel existe
        cur.execute("SELECT id FROM alarm_panels WHERE id = %s", (panel_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Panel no encontrado")
        
        # Eliminar zonas asociadas
        cur.execute("DELETE FROM panel_zones WHERE panel_id = %s", (panel_id,))
        
        # Eliminar eventos asociados
        cur.execute("DELETE FROM events WHERE panel_id = %s", (panel_id,))
        
        # Eliminar el panel
        cur.execute("DELETE FROM alarm_panels WHERE id = %s", (panel_id,))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Panel y datos asociados eliminados exitosamente"
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error deleting alarm panel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/alarm-panels/zone-types", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_zone_types():
    zone_types = [
        {"id": "PIR", "name": "Sensor de Movimiento"},
        {"id": "MAGNETIC", "name": "Contacto Magnético"},
        {"id": "SMOKE", "name": "Detector de Humo"},
        {"id": "GAS", "name": "Detector de Gas"},
        {"id": "GLASS", "name": "Rotura de Vidrio"},
        {"id": "PANIC", "name": "Botón de Pánico"},
        {"id": "MEDICAL", "name": "Emergencia Médica"},
        {"id": "TAMPER", "name": "Tamper"},
        {"id": "OTHER", "name": "Otro"}
    ]
    
    return {
        "status": "success",
        "data": zone_types
    }

@app.post("/test/send-event", dependencies=[Depends(check_permission(Permission.ALARMS_WRITE))])
async def send_test_event(event_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el panel existe
        cur.execute("""
            SELECT id, client_id 
            FROM alarm_panels 
            WHERE account_number = %s
        """, (event_data['account_number'],))
        
        panel = cur.fetchone()
        if not panel:
            raise HTTPException(status_code=404, detail="Panel no encontrado")
        
        # Crear evento
        timestamp = datetime.now(timezone.utc)
        message = f'["{event_data["account_number"]}"] {timestamp.strftime("%H%M%S,%m%d%y")}|{event_data["event_code"]}|{event_data["zone"]}'
        
        cur.execute("""
            INSERT INTO events (
                panel_id, event_type, raw_message,
                code, qualifier, zone_user,
                timestamp, priority
            ) VALUES (%s, 'SIA', %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            panel['id'], message, event_data['event_code'],
            event_data['event_code'][0], event_data['zone'],
            timestamp, 1 if event_data['event_code'] in ['BA', 'FA', 'PA'] else 2
        ))
        
        event_id = cur.fetchone()['id']
        conn.commit()
        
        return {
            "status": "success",
            "message": "Evento creado exitosamente",
            "event_id": event_id
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error creating test event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/events/history", dependencies=[Depends(check_permission(Permission.ALARMS_READ))])
async def get_events_history(
    status: str = 'all',
    priority: str = 'all',
    date_range: str = 'all'
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT 
                e.*,
                c.name as client_name,
                ap.account_number as panel_account,
                ec.description as event_description
            FROM events e
            JOIN alarm_panels ap ON e.panel_id = ap.id
            JOIN clients c ON ap.client_id = c.id
            LEFT JOIN event_codes ec ON e.code = ec.code 
                AND e.event_type = ec.protocol
            WHERE 1=1
        """
        params = []

        if status != 'all':
            query += " AND e.processed = %s"
            params.append(status == 'processed')

        if priority != 'all':
            query += " AND e.priority = %s"
            params.append(int(priority))

        if date_range != 'all':
            if date_range == 'today':
                query += " AND DATE(e.timestamp) = CURRENT_DATE"
            elif date_range == 'week':
                query += " AND e.timestamp >= CURRENT_DATE - INTERVAL '7 days'"
            elif date_range == 'month':
                query += " AND e.timestamp >= CURRENT_DATE - INTERVAL '30 days'"

        query += """
            ORDER BY 
                CASE WHEN e.processed = FALSE AND e.priority = 1 THEN 1
                     WHEN e.processed = FALSE THEN 2
                     ELSE 3 END,
                e.timestamp DESC
        """

        cur.execute(query, params)
        events = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(event) for event in events]
        }
        
    except Exception as e:
        print(f"Error getting events history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para CCTV
@app.get("/cameras", dependencies=[Depends(check_permission(Permission.CCTV_READ))])
async def get_cameras():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT 
                c.*,
                rd.name as device_name,
                cl.name as client_name
            FROM cameras c
            JOIN recording_devices rd ON c.device_id = rd.id
            JOIN clients cl ON rd.client_id = cl.id
            ORDER BY cl.name, rd.name, c.channel_number
        """)
        
        cameras = cur.fetchall()
        return {
            "status": "success",
            "data": [dict(camera) for camera in cameras]
        }
        
    except Exception as e:
        print(f"Error getting cameras: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/camera-events", dependencies=[Depends(check_permission(Permission.CCTV_WRITE))])
async def create_camera_event(event: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            INSERT INTO camera_events (
                camera_id, event_type, description,
                snapshot_url, timestamp
            ) VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            event['camera_id'], event['event_type'],
            event['description'], event.get('snapshot_url'),
            datetime.now(timezone.utc)
        ))
        
        event_id = cur.fetchone()['id']
        conn.commit()
        
        return {
            "status": "success",
            "event_id": event_id
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating camera event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para servicios técnicos
@app.get("/technical-services", dependencies=[Depends(check_permission(Permission.SERVICES_READ))])
async def get_technical_services(
    status: str = None,
    from_date: str = None,
    to_date: str = None,
    client_id: int = None
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT 
                ts.*,
                c.name as client_name,
                c.phone as client_phone,
                COALESCE(sa.technician_id, 0) as assigned_technician_id,
                COALESCE(u.username, '') as technician_name
            FROM technical_services ts
            JOIN clients c ON ts.client_id = c.id
            LEFT JOIN service_assignments sa ON ts.id = sa.service_id
            LEFT JOIN technicians t ON sa.technician_id = t.id
            LEFT JOIN users u ON t.user_id = u.id
            WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND ts.status = %s"
            params.append(status)
            
        if from_date:
            query += " AND ts.scheduled_date >= %s"
            params.append(from_date)
            
        if to_date:
            query += " AND ts.scheduled_date <= %s"
            params.append(to_date)
            
        if client_id:
            query += " AND ts.client_id = %s"
            params.append(client_id)
            
        query += " ORDER BY ts.priority ASC, ts.scheduled_date ASC"
        
        cur.execute(query, params)
        services = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(service) for service in services]
        }
        
    except Exception as e:
        print(f"Error getting technical services: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/technical-services", dependencies=[Depends(check_permission(Permission.SERVICES_WRITE))])
async def create_technical_service(service_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Insertar el servicio técnico
        cur.execute("""
            INSERT INTO technical_services (
                client_id, service_type, priority, description,
                estimated_duration, scheduled_date, location_lat,
                location_lon, address
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            service_data['client_id'],
            service_data['service_type'],
            service_data.get('priority', 2),
            service_data['description'],
            service_data.get('estimated_duration'),
            service_data.get('scheduled_date'),
            service_data.get('location_lat'),
            service_data.get('location_lon'),
            service_data.get('address')
        ))
        
        new_service = cur.fetchone()
        
        # Si se especifica un técnico, crear la asignación
        if 'technician_id' in service_data:
            cur.execute("""
                INSERT INTO service_assignments (
                    service_id, technician_id, estimated_arrival_time
                ) VALUES (%s, %s, %s)
            """, (
                new_service['id'],
                service_data['technician_id'],
                service_data.get('estimated_arrival_time')
            ))
        
        conn.commit()
        
        return {
            "status": "success",
            "data": dict(new_service)
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating technical service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/technical-services/{service_id}/assign", dependencies=[Depends(check_permission(Permission.SERVICES_ASSIGN))])
async def assign_technician(service_id: int, assignment_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el servicio existe y está pendiente
        cur.execute("""
            SELECT status FROM technical_services 
            WHERE id = %s
        """, (service_id,))
        
        service = cur.fetchone()
        if not service:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
        if service['status'] != 'pending':
            raise HTTPException(status_code=400, detail="El servicio ya está asignado o completado")
        
        # Crear la asignación
        cur.execute("""
            INSERT INTO service_assignments (
                service_id, technician_id, estimated_arrival_time
            ) VALUES (%s, %s, %s)
            RETURNING *
        """, (
            service_id,
            assignment_data['technician_id'],
            assignment_data.get('estimated_arrival_time')
        ))
        
        # Actualizar el estado del servicio
        cur.execute("""
            UPDATE technical_services 
            SET status = 'assigned'
            WHERE id = %s
        """, (service_id,))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Técnico asignado exitosamente"
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error assigning technician: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para técnicos
@app.get("/technicians", dependencies=[Depends(check_permission(Permission.TECHNICIANS_READ))])
async def get_technicians(available_only: bool = False):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT 
                t.*,
                u.username,
                COUNT(sa.id) as active_assignments
            FROM technicians t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN service_assignments sa ON t.id = sa.technician_id 
                AND sa.status != 'completed'
            WHERE 1=1
        """
        
        if available_only:
            query += " AND t.available = TRUE"
            
        query += " GROUP BY t.id, u.username ORDER BY u.username"
        
        cur.execute(query)
        technicians = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(tech) for tech in technicians]
        }
        
    except Exception as e:
        print(f"Error getting technicians: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para inventario
@app.get("/inventory", dependencies=[Depends(check_permission(Permission.INVENTORY_READ))])
async def get_inventory_items(
    category: str = None,
    low_stock: bool = False,
    supplier_id: int = None
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT 
                i.*,
                s.name as supplier_name,
                s.contact_person as supplier_contact
            FROM inventory_items i
            LEFT JOIN suppliers s ON i.supplier_id = s.id
            WHERE 1=1
        """
        params = []
        
        if category:
            query += " AND i.category = %s"
            params.append(category)
            
        if low_stock:
            query += " AND i.stock <= i.min_stock"
            
        if supplier_id:
            query += " AND i.supplier_id = %s"
            params.append(supplier_id)
            
        query += " ORDER BY i.category, i.name"
        
        cur.execute(query, params)
        items = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(item) for item in items]
        }
        
    except Exception as e:
        print(f"Error getting inventory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para rutas de técnicos
@app.post("/technician-routes/optimize", dependencies=[Depends(check_permission(Permission.TECHNICIANS_WRITE))])
async def optimize_technician_route(route_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener servicios pendientes para el técnico
        cur.execute("""
            SELECT 
                ts.*,
                c.name as client_name,
                c.address as service_address,
                ts.location_lat,
                ts.location_lon
            FROM technical_services ts
            JOIN clients c ON ts.client_id = c.id
            JOIN service_assignments sa ON ts.id = sa.service_id
            WHERE sa.technician_id = %s 
            AND ts.scheduled_date::date = %s
            AND ts.status = 'assigned'
            ORDER BY ts.priority, ts.scheduled_date
        """, (route_data['technician_id'], route_data['date']))
        
        services = cur.fetchall()
        
        if not services:
            return {
                "status": "success",
                "message": "No hay servicios para optimizar",
                "data": []
            }
        
        # Aquí iría la lógica de optimización de ruta
        # Por ahora, solo ordenamos por prioridad y hora programada
        optimized_services = sorted(
            services,
            key=lambda x: (x['priority'], x['scheduled_date'])
        )
        
        # Crear la ruta
        cur.execute("""
            INSERT INTO technician_routes (
                technician_id, date, start_location_lat,
                start_location_lon, status
            ) VALUES (%s, %s, %s, %s, 'planned')
            RETURNING id
        """, (
            route_data['technician_id'],
            route_data['date'],
            route_data['start_lat'],
            route_data['start_lon']
        ))
        
        route_id = cur.fetchone()['id']
        
        # Crear las paradas
        for idx, service in enumerate(optimized_services, 1):
            cur.execute("""
                INSERT INTO route_stops (
                    route_id, service_id, stop_number,
                    estimated_arrival_time, estimated_duration,
                    location_lat, location_lon
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                route_id,
                service['id'],
                idx,
                service['scheduled_date'],
                service['estimated_duration'],
                service['location_lat'],
                service['location_lon']
            ))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Ruta optimizada creada",
            "route_id": route_id
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error optimizing route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/technician-routes/{technician_id}/today", dependencies=[Depends(check_permission(Permission.TECHNICIANS_READ))])
async def get_technician_route(technician_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener la ruta actual
        cur.execute("""
            SELECT 
                tr.*,
                t.current_location_lat,
                t.current_location_lon,
                t.last_location_update
            FROM technician_routes tr
            JOIN technicians t ON tr.technician_id = t.id
            WHERE tr.technician_id = %s 
            AND tr.date = CURRENT_DATE
        """, (technician_id,))
        
        route = cur.fetchone()
        
        if not route:
            return {
                "status": "success",
                "message": "No hay ruta planificada para hoy",
                "data": None
            }
            
        # Obtener las paradas
        cur.execute("""
            SELECT 
                rs.*,
                ts.service_type,
                ts.description,
                ts.priority,
                c.name as client_name,
                c.phone as client_phone,
                c.address as service_address
            FROM route_stops rs
            JOIN technical_services ts ON rs.service_id = ts.id
            JOIN clients c ON ts.client_id = c.id
            WHERE rs.route_id = %s
            ORDER BY rs.stop_number
        """, (route['id'],))
        
        stops = cur.fetchall()
        
        route_data = dict(route)
        route_data['stops'] = [dict(stop) for stop in stops]
        
        return {
            "status": "success",
            "data": route_data
        }
        
    except Exception as e:
        print(f"Error getting technician route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/technician-routes/stops/{stop_id}/complete", dependencies=[Depends(check_permission(Permission.TECHNICIANS_WRITE))])
async def complete_route_stop(stop_id: int, completion_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Actualizar la parada
        cur.execute("""
            UPDATE route_stops SET
                status = 'completed',
                actual_arrival_time = %s,
                actual_duration = %s
            WHERE id = %s
            RETURNING route_id, service_id
        """, (
            datetime.now(timezone.utc),
            completion_data.get('duration'),
            stop_id
        ))
        
        stop_data = cur.fetchone()
        if not stop_data:
            raise HTTPException(status_code=404, detail="Parada no encontrada")
            
        # Actualizar el servicio técnico
        cur.execute("""
            UPDATE technical_services SET
                status = 'completed',
                completed_at = NOW()
            WHERE id = %s
        """, (stop_data['service_id'],))
        
        # Verificar si todas las paradas están completadas
        cur.execute("""
            SELECT COUNT(*) as total,
                   COUNT(*) FILTER (WHERE status = 'completed') as completed
            FROM route_stops
            WHERE route_id = %s
        """, (stop_data['route_id'],))
        
        counts = cur.fetchone()
        
        # Si todas las paradas están completadas, marcar la ruta como completada
        if counts['total'] == counts['completed']:
            cur.execute("""
                UPDATE technician_routes SET
                    status = 'completed',
                    end_location_lat = %s,
                    end_location_lon = %s
                WHERE id = %s
            """, (
                completion_data.get('lat'),
                completion_data.get('lon'),
                stop_data['route_id']
            ))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Parada completada exitosamente"
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error completing route stop: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para materiales usados en servicios
@app.post("/technical-services/{service_id}/materials", dependencies=[Depends(check_permission(Permission.SERVICES_WRITE))])
async def add_service_materials(service_id: int, materials: List[dict]):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar si el servicio existe
        cur.execute("SELECT id FROM technical_services WHERE id = %s", (service_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
        added_materials = []
        for material in materials:
            # Verificar stock disponible
            cur.execute("""
                SELECT stock, price FROM inventory_items 
                WHERE id = %s AND stock >= %s
            """, (material['material_id'], material['quantity']))
            
            inventory_item = cur.fetchone()
            if not inventory_item:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Stock insuficiente para el material {material['material_id']}"
                )
            
            # Calcular precio total
            total_price = inventory_item['price'] * material['quantity']
            
            # Registrar uso de material
            cur.execute("""
                INSERT INTO service_materials (
                    service_id, material_id, quantity,
                    unit_price, total_price, notes
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                service_id,
                material['material_id'],
                material['quantity'],
                inventory_item['price'],
                total_price,
                material.get('notes')
            ))
            
            added_material = cur.fetchone()
            
            # Actualizar stock
            cur.execute("""
                UPDATE inventory_items 
                SET stock = stock - %s 
                WHERE id = %s
            """, (material['quantity'], material['material_id']))
            
            added_materials.append(dict(added_material))
        
        conn.commit()
        
        return {
            "status": "success",
            "data": added_materials
        }
        
    except HTTPException as e:
        conn.rollback()
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Error adding service materials: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para reportes
@app.get("/reports/technician-performance", dependencies=[Depends(check_permission(Permission.REPORTS_READ))])
async def get_technician_performance(
    from_date: str = None,
    to_date: str = None,
    technician_id: int = None
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            WITH service_stats AS (
                SELECT 
                    t.id as technician_id,
                    u.username as technician_name,
                    COUNT(ts.id) as total_services,
                    COUNT(ts.id) FILTER (WHERE ts.status = 'completed') as completed_services,
                    AVG(EXTRACT(EPOCH FROM (ts.completed_at - sa.actual_arrival_time))/60) as avg_service_duration,
                    AVG(sf.rating) as avg_rating
                FROM technicians t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN service_assignments sa ON t.id = sa.technician_id
                LEFT JOIN technical_services ts ON sa.service_id = ts.id
                LEFT JOIN service_feedback sf ON ts.id = sf.service_id
                WHERE 1=1
        """
        params = []
        
        if from_date:
            query += " AND ts.scheduled_date >= %s"
            params.append(from_date)
            
        if to_date:
            query += " AND ts.scheduled_date <= %s"
            params.append(to_date)
            
        if technician_id:
            query += " AND t.id = %s"
            params.append(technician_id)
            
        query += """
                GROUP BY t.id, u.username
            )
            SELECT 
                s.*,
                ROUND((s.completed_services::float / NULLIF(s.total_services, 0) * 100)::numeric, 2) as completion_rate,
                ROUND(s.avg_service_duration::numeric, 2) as avg_duration_minutes,
                ROUND(s.avg_rating::numeric, 2) as satisfaction_rating
            FROM service_stats s
            ORDER BY s.completion_rate DESC
        """
        
        cur.execute(query, params)
        performance_data = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(record) for record in performance_data]
        }
        
    except Exception as e:
        print(f"Error getting technician performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/reports/service-statistics", dependencies=[Depends(check_permission(Permission.REPORTS_READ))])
async def get_service_statistics(
    period: str = 'month',  # day, week, month, year
    from_date: str = None,
    to_date: str = None
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Determinar el intervalo de agrupación
        interval = {
            'day': "DATE_TRUNC('hour', ts.scheduled_date)",
            'week': "DATE_TRUNC('day', ts.scheduled_date)",
            'month': "DATE_TRUNC('day', ts.scheduled_date)",
            'year': "DATE_TRUNC('month', ts.scheduled_date)"
        }.get(period, "DATE_TRUNC('day', ts.scheduled_date)")
        
        query = f"""
            SELECT 
                {interval} as period,
                COUNT(*) as total_services,
                COUNT(*) FILTER (WHERE ts.status = 'completed') as completed_services,
                COUNT(*) FILTER (WHERE ts.status = 'cancelled') as cancelled_services,
                AVG(EXTRACT(EPOCH FROM (ts.completed_at - sa.actual_arrival_time))/60) 
                    FILTER (WHERE ts.status = 'completed') as avg_duration,
                COUNT(DISTINCT ts.client_id) as unique_clients,
                COUNT(DISTINCT sa.technician_id) as technicians_involved
            FROM technical_services ts
            LEFT JOIN service_assignments sa ON ts.id = sa.service_id
            WHERE 1=1
        """
        params = []
        
        if from_date:
            query += " AND ts.scheduled_date >= %s"
            params.append(from_date)
            
        if to_date:
            query += " AND ts.scheduled_date <= %s"
            params.append(to_date)
            
        query += f" GROUP BY {interval} ORDER BY period"
        
        cur.execute(query, params)
        statistics = cur.fetchall()
        
        # Calcular métricas adicionales
        for stat in statistics:
            stat['completion_rate'] = round(
                (stat['completed_services'] / stat['total_services'] * 100)
                if stat['total_services'] > 0 else 0,
                2
            )
            stat['avg_duration'] = round(stat['avg_duration'] or 0, 2)
            
        return {
            "status": "success",
            "data": [dict(stat) for stat in statistics]
        }
        
    except Exception as e:
        print(f"Error getting service statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para notificaciones
@app.get("/notifications", dependencies=[Depends(check_permission(Permission.USERS_READ))])
async def get_user_notifications(
    user_id: int,
    unread_only: bool = False,
    limit: int = 50
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT * FROM notifications
            WHERE user_id = %s
        """
        params = [user_id]
        
        if unread_only:
            query += " AND read = FALSE"
            
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        cur.execute(query, params)
        notifications = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(notif) for notif in notifications]
        }
        
    except Exception as e:
        print(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/notifications/mark-read", dependencies=[Depends(check_permission(Permission.USERS_WRITE))])
async def mark_notifications_read(notification_ids: List[int]):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE notifications 
            SET read = TRUE, read_at = NOW()
            WHERE id = ANY(%s)
        """, (notification_ids,))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Notificaciones marcadas como leídas"
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error marking notifications as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para integración con mapas
@app.get("/map/technicians", dependencies=[Depends(check_permission(Permission.TECHNICIANS_TRACK))])
async def get_technicians_locations():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("""
            SELECT 
                t.id,
                u.username,
                t.current_location_lat,
                t.current_location_lon,
                t.last_location_update,
                t.available,
                COUNT(sa.id) FILTER (WHERE sa.status = 'in_progress') as active_services
            FROM technicians t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN service_assignments sa ON t.id = sa.technician_id
            WHERE t.current_location_lat IS NOT NULL
            GROUP BY t.id, u.username
        """)
        
        locations = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(loc) for loc in locations]
        }
        
    except Exception as e:
        print(f"Error getting technician locations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/map/update-location", dependencies=[Depends(check_permission(Permission.TECHNICIANS_TRACK))])
async def update_technician_location(technician_id: int, location_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE technicians SET
                current_location_lat = %s,
                current_location_lon = %s,
                last_location_update = NOW()
            WHERE id = %s
        """, (
            location_data['latitude'],
            location_data['longitude'],
            technician_id
        ))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Ubicación actualizada"
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating technician location: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.get("/map/service-locations", dependencies=[Depends(check_permission(Permission.SERVICES_READ))])
async def get_service_locations(
    date: str = None,
    status: str = None,
    technician_id: int = None
):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        query = """
            SELECT 
                ts.id,
                ts.service_type,
                ts.status,
                ts.priority,
                ts.scheduled_date,
                ts.location_lat,
                ts.location_lon,
                c.name as client_name,
                c.address,
                COALESCE(u.username, 'Sin asignar') as technician_name
            FROM technical_services ts
            JOIN clients c ON ts.client_id = c.id
            LEFT JOIN service_assignments sa ON ts.id = sa.service_id
            LEFT JOIN technicians t ON sa.technician_id = t.id
            LEFT JOIN users u ON t.user_id = u.id
            WHERE ts.location_lat IS NOT NULL
        """
        params = []
        
        if date:
            query += " AND DATE(ts.scheduled_date) = %s"
            params.append(date)
            
        if status:
            query += " AND ts.status = %s"
            params.append(status)
            
        if technician_id:
            query += " AND sa.technician_id = %s"
            params.append(technician_id)
            
        query += " ORDER BY ts.priority, ts.scheduled_date"
        
        cur.execute(query, params)
        locations = cur.fetchall()
        
        return {
            "status": "success",
            "data": [dict(loc) for loc in locations]
        }
        
    except Exception as e:
        print(f"Error getting service locations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Endpoints para tickets de servicio
@app.post("/service-tickets", dependencies=[Depends(check_permission(Permission.SERVICES_WRITE))])
async def create_service_ticket(ticket_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Crear el ticket
        cur.execute("""
            INSERT INTO service_tickets (
                client_id, category, subcategory, priority,
                description, status, created_by, estimated_time
            ) VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s)
            RETURNING id
        """, (
            ticket_data['client_id'],
            ticket_data['category'],
            ticket_data.get('subcategory'),
            ticket_data.get('priority', 2),
            ticket_data['description'],
            ticket_data['created_by'],
            ticket_data.get('estimated_time')
        ))
        
        ticket_id = cur.fetchone()['id']
        
        # Procesar con IA para sugerencias
        suggestions = await process_ticket_with_ai(ticket_data['description'])
        
        # Guardar sugerencias
        if suggestions:
            cur.execute("""
                INSERT INTO ticket_suggestions (
                    ticket_id, suggested_solution, confidence_level,
                    similar_cases, estimated_resolution_time
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                ticket_id,
                suggestions['solution'],
                suggestions['confidence'],
                suggestions['similar_cases'],
                suggestions['estimated_time']
            ))
        
        conn.commit()
        
        return {
            "status": "success",
            "ticket_id": ticket_id,
            "suggestions": suggestions
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating service ticket: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

async def process_ticket_with_ai(description: str):
    """
    Procesa el ticket con IA para obtener sugerencias
    """
    try:
        # Aquí iría la lógica de integración con el modelo de IA
        # Por ahora, retornamos un ejemplo
        return {
            "solution": "Basado en la descripción, se sugiere verificar...",
            "confidence": 0.85,
            "similar_cases": ["TICKET-123", "TICKET-456"],
            "estimated_time": 60  # minutos
        }
    except Exception as e:
        print(f"Error processing ticket with AI: {str(e)}")
        return None

@app.get("/service-tickets/{ticket_id}/suggestions", dependencies=[Depends(check_permission(Permission.SERVICES_READ))])
async def get_ticket_suggestions(ticket_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener sugerencias existentes
        cur.execute("""
            SELECT * FROM ticket_suggestions
            WHERE ticket_id = %s
            ORDER BY confidence_level DESC
        """, (ticket_id,))
        
        suggestions = cur.fetchall()
        
        # Si no hay sugerencias, procesar con IA
        if not suggestions:
            cur.execute("""
                SELECT description FROM service_tickets
                WHERE id = %s
            """, (ticket_id,))
            
            ticket = cur.fetchone()
            if ticket:
                new_suggestions = await process_ticket_with_ai(ticket['description'])
                if new_suggestions:
                    cur.execute("""
                        INSERT INTO ticket_suggestions (
                            ticket_id, suggested_solution, confidence_level,
                            similar_cases, estimated_resolution_time
                        ) VALUES (%s, %s, %s, %s, %s)
                        RETURNING *
                    """, (
                        ticket_id,
                        new_suggestions['solution'],
                        new_suggestions['confidence'],
                        new_suggestions['similar_cases'],
                        new_suggestions['estimated_time']
                    ))
                    
                    suggestions = [cur.fetchone()]
                    conn.commit()
        
        return {
            "status": "success",
            "data": [dict(suggestion) for suggestion in suggestions]
        }
        
    except Exception as e:
        print(f"Error getting ticket suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.post("/service-tickets/{ticket_id}/ai-analysis", dependencies=[Depends(check_permission(Permission.SERVICES_WRITE))])
async def analyze_ticket_with_ai(ticket_id: int, analysis_type: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Obtener información del ticket
        cur.execute("""
            SELECT 
                t.*,
                c.name as client_name,
                c.address as client_address,
                array_agg(DISTINCT p.panel_type) as panel_types,
                array_agg(DISTINCT e.event_type) as recent_events
            FROM service_tickets t
            JOIN clients c ON t.client_id = c.id
            LEFT JOIN alarm_panels p ON c.id = p.client_id
            LEFT JOIN events e ON p.id = e.panel_id 
                AND e.timestamp > NOW() - INTERVAL '30 days'
            WHERE t.id = %s
            GROUP BY t.id, c.name, c.address
        """, (ticket_id,))
        
        ticket_info = cur.fetchone()
        if not ticket_info:
            raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
        # Realizar análisis según el tipo
        analysis_result = None
        if analysis_type == 'solution_prediction':
            analysis_result = await predict_solution(dict(ticket_info))
        elif analysis_type == 'time_estimation':
            analysis_result = await estimate_resolution_time(dict(ticket_info))
        elif analysis_type == 'technician_recommendation':
            analysis_result = await recommend_technician(dict(ticket_info))
        
        if analysis_result:
            # Guardar resultado del análisis
            cur.execute("""
                INSERT INTO ticket_ai_analysis (
                    ticket_id, analysis_type, result,
                    confidence_level, created_at
                ) VALUES (%s, %s, %s, %s, NOW())
                RETURNING *
            """, (
                ticket_id,
                analysis_type,
                analysis_result['result'],
                analysis_result['confidence']
            ))
            
            analysis_record = cur.fetchone()
            conn.commit()
            
            return {
                "status": "success",
                "data": dict(analysis_record)
            }
        
        raise HTTPException(status_code=400, detail="Tipo de análisis no soportado")
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error analyzing ticket with AI: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Funciones de IA (mock por ahora)
async def predict_solution(ticket_info: dict):
    return {
        "result": {
            "suggested_solution": "Basado en el historial...",
            "steps": ["Paso 1...", "Paso 2..."],
            "required_materials": ["Material 1", "Material 2"]
        },
        "confidence": 0.85
    }

async def estimate_resolution_time(ticket_info: dict):
    return {
        "result": {
            "estimated_minutes": 120,
            "factors": ["Complejidad del problema", "Historial del cliente"],
            "confidence_range": {"min": 90, "max": 150}
        },
        "confidence": 0.75
    }

async def recommend_technician(ticket_info: dict):
    return {
        "result": {
            "recommended_technicians": [
                {"id": 1, "score": 0.95},
                {"id": 2, "score": 0.85}
            ],
            "factors": ["Experiencia", "Ubicación", "Carga de trabajo"]
        },
        "confidence": 0.80
    }