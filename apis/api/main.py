from fastapi import FastAPI
from fastapi_fs_router import load_fs_router

from models import create_tables


app = FastAPI(
    title="devfive template api",
    description="devfive template api",
)
create_tables()

load_fs_router(app)
