from datetime import datetime, timezone
from sqlmodel import TIMESTAMP, Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(
        primary_key=True,
        default=None,
    )
    name: str
    username: str
    password: str
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_type=TIMESTAMP(timezone=True),  # type: ignore
    )

    updated_at: datetime | None = Field(
        sa_column_kwargs={
            "onupdate": lambda: datetime.now(timezone.utc),
        },
        sa_type=TIMESTAMP(timezone=True),  # type: ignore
    )
