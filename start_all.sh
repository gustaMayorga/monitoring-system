#!/bin/bash

# Iniciar backend
cd backend
python run_servers.py &
sleep 5

# Iniciar frontend
cd ../frontend
npm run dev &
sleep 5

# Iniciar simulador
cd ../backend
python -m alarm_server.simulator &

# Esperar a que el usuario presione Ctrl+C
wait 