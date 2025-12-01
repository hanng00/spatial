# Spatial Data Pipeline

Modular data pipeline with Dagster orchestration, containerized execution, and AWS deployment.

## Architecture

- **ingestion/**: DLT-based data ingestion (containerized)
- **transformations_dbt/**: DBT transformations (containerized)
- **orchestration_dagster/**: Dagster OSS orchestration
- **cognition/**: ML/AI tasks (containerized)
- **frontend/**: Next.js frontend
- **infra_cdk/**: AWS CDK infrastructure


## Local Development

### Prerequisites

- Docker & Docker Compose
- Python 3.13+ with `uv` installed
- `MOTHERDUCK_ACCESS_TOKEN` environment variable

### Quick Start

1. **Start all containers:**
   ```bash
   docker compose up -d
   ```

2. **Build containers if needed:**
   ```bash
   docker compose build
   ```

3. **Run Dagster:**
   ```bash
   cd orchestration_dagster
   uv sync
   uv run dagster dev
   ```

4. **Open Dagster UI:**
   - Navigate to http://localhost:3000
   - All assets (ingestion, dbt, cognition) are visible
   - Click "Materialize" on any asset → It executes via Docker containers

### Environment Variables

Copy `.env.example` to `.env` and set:
- `MOTHERDUCK_ACCESS_TOKEN`: Your MotherDuck token
- `DATABASE_NAME`: Database name (default: `spatial_dagster`)
- `DAGSTER_ENVIRONMENT`: `local` (default) or `production`

## How It Works

### Container Execution Abstraction

All assets use `ContainerExecutor` resource that abstracts execution:

- **Local**: Executes containers via Docker SDK on `spatial-network`
- **Production**: Executes containers via ECS Tasks in AWS

Assets don't know the difference - same code works everywhere.

### Developer Experience

1. **Manage assets in Dagster UI** - No CLI commands needed
2. **Click "Materialize"** - Container executes automatically
3. **View logs in Dagster UI** - Streamed from containers
4. **Same experience locally and in production**

## Production Deployment

See `DX_ARCHITECTURE.md` for detailed deployment guide.

### Key Points

- Set `DAGSTER_ENVIRONMENT=production`
- Configure ECS cluster, task definitions, subnets, security groups
- ContainerExecutor automatically uses ECS instead of Docker
- Same Dagster UI, same assets, same workflow

## Module Details

### Ingestion

```bash
# Build container
docker build -f ingestion/Dockerfile -t spatial/ingestion:latest .

# Run manually (for testing)
docker run --rm \
  -e MOTHERDUCK_ACCESS_TOKEN=$TOKEN \
  spatial/ingestion:latest run anforandelista
```

### Transformations (DBT)

```bash
# Build container
docker build -f transformations_dbt/Dockerfile -t spatial/transformations_dbt:latest .

# Run manually (for testing)
docker run --rm \
  -e MOTHERDUCK_ACCESS_TOKEN=$TOKEN \
  spatial/transformations_dbt:latest run --select stg.*
```

### Cognition

```bash
# Build container
docker build -f cognition/Dockerfile -t spatial/cognition:latest .

# Run manually (for testing)
docker run --rm \
  -e MOTHERDUCK_ACCESS_TOKEN=$TOKEN \
  spatial/cognition:latest embed source_table output_table
```

## Docker Compose

All containers are defined in `docker-compose.yml`:

- **spatial-network**: Shared Docker network for container communication
- **Services**: ingestion, transformations_dbt, cognition
- **No ports exposed**: Containers accessed via Docker network

## Troubleshooting

### Containers not found

```bash
# Rebuild containers
docker compose build

# Check containers are running
docker compose ps
```

### Network issues

```bash
# Recreate network
docker network rm spatial-network
docker compose up -d
```

### Dagster can't find assets

```bash
# Ensure containers are built
docker compose build

# Check Dagster can import modules
cd orchestration_dagster
uv run python -c "from orchestration_dagster.definitions import defs; print('OK')"
```

## Learn More

- [Dagster Documentation](https://docs.dagster.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [DX Architecture](./DX_ARCHITECTURE.md) - Detailed developer experience design
