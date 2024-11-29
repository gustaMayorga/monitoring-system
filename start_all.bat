@echo off
echo Iniciando servicios...

REM Verificar directorios
if not exist "backend" (
    echo Error: No se encuentra el directorio backend
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: No se encuentra el directorio frontend
    pause
    exit /b 1
)

REM Matar procesos Python existentes que puedan estar usando los puertos
taskkill /F /IM python.exe 2>nul
timeout /t 2

REM Iniciar backend (servidor API y servidor de alarmas)
echo Iniciando backend...
cd backend
start cmd /k "python run_servers.py"

echo Esperando que los servidores inicien...
timeout /t 15

REM Iniciar frontend
echo Iniciando frontend...
cd ../frontend
start cmd /k "npm run dev"

echo Esperando que el frontend inicie...
timeout /t 10

REM Iniciar simulador
echo Iniciando simulador...
cd ../backend
start cmd /k "python -m alarm_server.simulator"

echo.
echo Todos los servicios iniciados.
echo Para probar:
echo 1. Abre http://localhost:5173 en tu navegador
echo 2. Inicia sesión como admin/admin
echo 3. Ve a la página de monitoreo
echo 4. Abre el panel de pruebas en otra pestaña
echo.
pause 