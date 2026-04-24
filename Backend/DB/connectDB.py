from sqlalchemy import create_engine
from dotenv import dotenv_values
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
class DB:
    # Define Base at class level so all DB() instances share the same metadata registry.
    shared_base = declarative_base()
    shared_engine = None

    def __init__(self):
        try:
            self.config = dotenv_values(".env.development")
            if DB.shared_engine is None:
                DB.shared_engine = create_engine(self.config["DATABASE_URL"]) # type: ignore
            
            self.engine = DB.shared_engine
            self.Base = DB.shared_base
        except Exception as e:
            print(f"Error connecting to the database: {e}")
            raise e
    def return_session(self):
        try:
            Session = sessionmaker(bind=self.engine,autoflush=False,autocommit=False)
            return Session()
        except Exception as e:
            print(f"Error creating a database session: {e}")
            raise e