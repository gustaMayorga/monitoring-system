# backend/run_dev.sh
#!/bin/bash
export PYTHONPATH=$PYTHONPATH:$(pwd)
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000