# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base

# Prevents Python from writing .pyc files and buffering stdout/err
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application code
COPY app ./app

# Create runtime directories referenced in config defaults
RUN mkdir -p /app/data/chroma_db /app/data/uploads

# Expose FastAPI port
EXPOSE 8000

# Default to production; override as needed
ENV DEBUG=false

# Entrypoint: uvicorn server
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
