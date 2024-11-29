@echo off

REM Instalar dependencias del proyecto principal
call npm install

REM Instalar dependencias del backend y frontend
call npm run install:all

REM Configurar la base de datos
cd backend
copy .env.example .env
call npm run setup:db
cd ..

REM Configurar el frontend
cd frontend
copy .env.example .env
cd ..

echo Proyecto inicializado correctamente 