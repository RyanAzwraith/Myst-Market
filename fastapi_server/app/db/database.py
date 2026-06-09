from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

class Database:
    def __init__(self, config):
        self.url = config.database_url
        self.engine = create_engine(
            self.url,
            connect_args={"check_same_thread": False},
            
        ) 
        self.Session_Local = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def get_session(self):
        db = self.Session_Local()
        try:
            yield db
        finally:
            db.close()
