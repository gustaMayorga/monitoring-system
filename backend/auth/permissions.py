from enum import Enum
from typing import List, Dict
from fastapi import HTTPException, Depends
from .jwt import get_current_user

class Permission(str, Enum):
    # Permisos de administración
    ADMIN_ALL = "admin:all"
    
    # Permisos de usuarios
    USERS_READ = "users:read"
    USERS_WRITE = "users:write"
    
    # Permisos de clientes
    CLIENTS_READ = "clients:read"
    CLIENTS_WRITE = "clients:write"
    
    # Permisos de alarmas
    ALARMS_READ = "alarms:read"
    ALARMS_WRITE = "alarms:write"
    ALARMS_ACKNOWLEDGE = "alarms:acknowledge"
    
    # Permisos de cámaras
    CAMERAS_READ = "cameras:read"
    CAMERAS_WRITE = "cameras:write"
    CAMERAS_CONTROL = "cameras:control"
    
    # Permisos de reportes
    REPORTS_READ = "reports:read"
    REPORTS_WRITE = "reports:write"
    
    # Permisos técnicos
    TECHNICAL_READ = "technical:read"
    TECHNICAL_WRITE = "technical:write"

ROLE_PERMISSIONS: Dict[str, List[Permission]] = {
    "admin": [Permission.ADMIN_ALL],
    "administrative": [
        Permission.CLIENTS_READ,
        Permission.CLIENTS_WRITE,
        Permission.REPORTS_READ,
        Permission.REPORTS_WRITE
    ],
    "operator": [
        Permission.ALARMS_READ,
        Permission.ALARMS_WRITE,
        Permission.ALARMS_ACKNOWLEDGE,
        Permission.CAMERAS_READ,
        Permission.CAMERAS_CONTROL
    ],
    "technical": [
        Permission.TECHNICAL_READ,
        Permission.TECHNICAL_WRITE,
        Permission.CAMERAS_READ,
        Permission.ALARMS_READ
    ]
}

def check_permission(required_permission: Permission):
    async def permission_dependency(current_user = Depends(get_current_user)):
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        user_role = current_user.get("role", "")
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        
        if Permission.ADMIN_ALL in user_permissions:
            return True
            
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=403,
                detail=f"No tiene permiso para realizar esta acción: {required_permission}"
            )
        
        return True
    
    return permission_dependency 