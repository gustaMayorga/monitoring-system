#!/bin/bash

# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend y frontend
npm run install:all

# Configurar la base de datos
cd backend
cp .env.example .env
npm run setup:db
cd ..

# Configurar el frontend
cd frontend
cp .env.example .env
cd ..

echo "Proyecto inicializado correctamente" 