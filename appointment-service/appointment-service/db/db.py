from db.model import BaseModel
from sqlalchemy import create_engine

class Database:

    def __init__(self, db_path = "sqlite:///appointments.db", echo=False) -> None:
        self.engine = create_engine(url=db_path, echo=echo)
        self._generate_schema()
        
    def _generate_schema(self) -> None:
            BaseModel.metadata.create_all(self.engine)