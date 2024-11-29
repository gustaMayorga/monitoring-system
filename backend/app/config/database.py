import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import DictCursor

load_dotenv()

DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'monitoring_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'veoveo77'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise e

# ... resto del código igual 