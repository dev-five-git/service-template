from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi_fs_router import load_fs_router

from models import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="devfive template api",
    description="devfive template api",
)

load_fs_router(app)
