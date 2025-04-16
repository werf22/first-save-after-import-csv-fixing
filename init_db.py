from sqlmodel import SQLModel, create_engine
from models import *

***REMOVED*** = "sqlite:///./tasks.db"
engine = create_engine(***REMOVED***, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
