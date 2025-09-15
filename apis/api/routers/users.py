from fastapi import APIRouter, Query

user_router = APIRouter()


@user_router.get("/users")
async def get_users(q_id: str = Query(alias="qId")):
    return {"message": "Hello, World!"}
