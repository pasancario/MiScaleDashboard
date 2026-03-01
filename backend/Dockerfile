# Use the official Python image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy pyproject.toml
COPY pyproject.toml .

# Install dependencies into system Python environment (for simpler container management)
RUN uv pip install --system -r pyproject.toml

# Copy application source
COPY . .

# Expose port 8000
EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
