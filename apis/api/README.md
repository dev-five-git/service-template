# Api

## Alembic Command

Create revision file
```bash
uv run alembic revision --autogenerate -m "Added account table"
```

Update revision
```bash
uv run alembic upgrade head
```