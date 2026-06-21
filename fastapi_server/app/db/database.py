from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

class Database:
    def __init__(self, database_url):
        self.url = database_url
        self.engine = create_engine(
            self.url,
            connect_args={"check_same_thread": False},
            
        ) 
        self.make_session = sessionmaker(autobegin=True, autocommit=False, autoflush=False, bind=self.engine)

    def get_session(self):
        session = self.make_session()
        try:
            yield session
        finally:
            session.close()
