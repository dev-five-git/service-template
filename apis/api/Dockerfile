FROM ghcr.io/astral-sh/uv:python3.13-alpine

RUN pip install uvicorn

WORKDIR /app

COPY pyproject.toml ./

RUN uv sync 

COPY . .

EXPOSE 8000

ENV PYTHONPATH=/app
ENV HOST=0.0.0.0
ENV PORT=8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 