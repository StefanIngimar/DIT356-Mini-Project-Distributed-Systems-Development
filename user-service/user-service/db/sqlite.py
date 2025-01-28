from sqlalchemy import create_engine

from db.model import BaseModel


class Sqlite:
    def __init__(self, db_path: str, echo=False) -> None:
        self.engine = create_engine(url=db_path, echo=echo)
        self._generate_schema()

    def _generate_schema(self) -> None:
        BaseModel.metadata.create_all(self.engine)
