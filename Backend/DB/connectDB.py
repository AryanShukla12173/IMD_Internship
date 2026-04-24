from sqlalchemy import create_engine
import os

class DB:
    def __init__(self):
        self.engine = create_engine(os.getenv("DATABASE_URL"), connect_args={"check_same_thread": False})