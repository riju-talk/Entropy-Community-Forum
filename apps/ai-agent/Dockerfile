ARG PYTHON_VERSION=3.13.5

# Builder stage: create wheels for all requirements (reduces final image size)
FROM python:${PYTHON_VERSION}-slim AS builder
WORKDIR /wheels

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libssl-dev libffi-dev libxml2-dev libxslt1-dev git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and build wheels
COPY requirements.txt /wheels/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r /wheels/requirements.txt

# Runtime stage: slim image with only installed wheels
FROM python:${PYTHON_VERSION}-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install minimal runtime system packages (adjust if needed for native libs)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libssl-dev libffi-dev libxml2 libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels from builder and install
COPY --from=builder /wheels /wheels
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir /wheels/*.whl

# Copy application code
COPY . /app

# Expose port used by the container
EXPOSE 8080

# Default command: Gunicorn with Uvicorn worker
CMD ["sh", "-c", "gunicorn -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:${PORT:-8080} --workers 1 --timeout 120"]
FROM python:3.13-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install minimal system deps required for common Python packages and healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       gcc \
       libpq-dev \
       curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust (for chromadb, pydantic-core, etc.)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && export PATH="$PATH:/root/.cargo/bin"

# Create app directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install requirements
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create a non-root user and fix permissions
RUN useradd --create-home --shell /bin/bash ai \
    && chown -R ai:ai /app

USER ai

# Expose application port
EXPOSE 8000

# Healthcheck - uses curl (installed above)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Default production command using Gunicorn + Uvicorn workers
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "-b", "0.0.0.0:8000", "--workers", "2", "--log-level", "info"]
