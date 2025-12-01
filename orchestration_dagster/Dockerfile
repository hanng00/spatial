FROM python:3.11-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy orchestration project files
COPY pyproject.toml uv.lock* ./
COPY src/ ./src/

# Install dependencies with uv
RUN uv sync --frozen --no-dev

# Copy dbt project (needed for DbtProjectComponent to read manifest)
# Note: Build context should be set to parent directory (spatial/) to access transformations_dbt
# Example: docker build -f orchestration_dagster/Dockerfile -t orchestration_dagster:latest .
COPY transformations_dbt/ ./transformations_dbt/

# Create symlink to match local path structure (../transformations_dbt)
# In Docker: project_root = /app, so ../transformations_dbt = /transformations_dbt
# Create symlink: /transformations_dbt -> /app/transformations_dbt
RUN ln -sf /app/transformations_dbt /transformations_dbt

# Prepare dbt project (runs dbt deps and dbt parse to create manifest.json)
# This uses uv to run dagster-dbt command
RUN uv run dagster-dbt project prepare-and-package --components /app

# Set working directory to orchestration root
WORKDIR /app

# Expose Dagster webserver port
EXPOSE 3000

# Default command: run Dagster webserver
# In production, you might want to run: dagster-daemon run
CMD ["uv", "run", "dagster", "dev", "-h", "0.0.0.0", "-p", "3000"]

