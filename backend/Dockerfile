FROM python:3.14-rc-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-cache
COPY backend/ .
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
