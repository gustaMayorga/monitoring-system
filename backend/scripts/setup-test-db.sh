#!/bin/bash

# Cargar variables de entorno de prueba
set -a
source .env.test
set +a

echo "Configurando base de datos de pruebas: $DB_NAME"

# Crear base de datos de pruebas
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Ejecutar migraciones en la base de datos de pruebas
NODE_ENV=test npm run migrate

echo "Base de datos de pruebas configurada exitosamente"