from sqlmodel import create_engine, SQLModel
from auto_import_py import auto_import


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"


def create_tables():
    auto_import()
    engine = create_engine(sqlite_url, echo=True)

    SQLModel.metadata.create_all(engine)
