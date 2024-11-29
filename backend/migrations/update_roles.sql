-- Actualizar permisos del rol operador
UPDATE roles 
SET permissions = permissions || '["alarms:read", "alarms:write", "alarms:acknowledge", "alarms:dispatch", "alarms:close"]'::jsonb
WHERE name = 'operator';

-- Actualizar permisos del rol admin
UPDATE roles 
SET permissions = permissions || '["alarms:read", "alarms:write", "alarms:acknowledge", "alarms:dispatch", "alarms:close"]'::jsonb
WHERE name = 'admin'; 