# Spatial Infrastructure (AWS CDK)

AWS CDK infrastructure for the spatial data pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     App Runner                               │
│  dagster-spatial.xxxx.us-east-1.awsapprunner.com            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  nginx (basic auth) → dagster webserver + daemon    │    │
│  │  - Min instances: 0  (scale to zero)                │    │
│  │  - Cold start: ~60-90s                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │
         ├──→ DSQL (Dagster metadata) ──→ scales to zero
         │
         └──→ ECS Tasks (Fargate Spot, on-demand)
                  │
                  ├── spatial/ingestion:latest
                  └── spatial/transformations-dbt:latest
                           │
                           ↓
                      MotherDuck (SaaS)
```

## Stacks

| Stack | Resources | Purpose |
|-------|-----------|---------|
| `SpatialEcrStack` | ECR repos | Container image storage |
| `SpatialDsqlStack` | Aurora DSQL | Dagster metadata (serverless) |
| `SpatialEcsTasksStack` | ECS cluster, task defs, VPC | Worker containers |
| `SpatialDagsterStack` | App Runner | Dagster UI |

## Prerequisites

1. AWS CLI configured with credentials
2. Bun (or Node.js 18+)
3. CDK CLI (auto-installed via bunx)

## Deployment

### First-time setup

```bash
cd infra
bun install

# Bootstrap CDK (one-time per account/region)
bunx cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

### Deploy all stacks

```bash
bun run deploy
```

### Deploy individual stacks (in order)

```bash
npm run deploy:ecr       # 1. ECR repos first
npm run deploy:dsql      # 2. DSQL database
# Push images to ECR     # 3. See "Push Images" section
npm run deploy:ecs       # 4. ECS tasks
npm run deploy:dagster   # 5. Dagster App Runner
```

## Push Container Images

After deploying ECR stack, push images:

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push ingestion
docker build -f ingestion/Dockerfile -t spatial/ingestion:latest .
docker tag spatial/ingestion:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spatial/ingestion:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spatial/ingestion:latest

# Build and push dbt
docker build -f transformations_dbt/Dockerfile -t spatial/transformations-dbt:latest .
docker tag spatial/transformations-dbt:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spatial/transformations-dbt:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spatial/transformations-dbt:latest

# Build and push Dagster (App Runner image)
docker build -f orchestration_dagster/Dockerfile.apprunner -t spatial/dagster:latest .
docker tag spatial/dagster:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spatial/dagster:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spatial/dagster:latest
```

## Configure Secrets

After deployment, update secrets in AWS Secrets Manager:

### 1. Worker secrets (`spatial/secrets`)
```bash
aws secretsmanager put-secret-value \
  --secret-id spatial/secrets \
  --secret-string '{"MOTHERDUCK_ACCESS_TOKEN":"your_token","DATABASE_NAME":"spatial_dagster"}'
```

### 2. Dagster secrets (`spatial/dagster-secrets`)
```bash
aws secretsmanager put-secret-value \
  --secret-id spatial/dagster-secrets \
  --secret-string '{"BASIC_AUTH_USERNAME":"admin","BASIC_AUTH_PASSWORD":"your_secure_password","MOTHERDUCK_ACCESS_TOKEN":"your_token","DATABASE_NAME":"spatial_dagster"}'
```

## Estimated Costs

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| App Runner | ~$5-10 | Min $5 for endpoint, scales to 0 |
| DSQL | ~$0-1 | Pay per request, scales to zero |
| ECS Fargate | ~$0-5 | Only when tasks run |
| ECR | ~$0-1 | Image storage |
| **Total** | **~$5-20/mo** | At idle: ~$5/mo |

## Useful Commands

```bash
npm run build    # Compile TypeScript
npm run synth    # Synthesize CloudFormation
npm run diff     # Compare with deployed stacks
cdk destroy      # Destroy all stacks
```

## Troubleshooting

### App Runner cold start slow
Cold start takes 60-90 seconds. This is expected when scaling from 0.

### DSQL connection issues
DSQL uses IAM authentication. Ensure the App Runner instance role has `dsql:DbConnect` permission.

### ECS tasks failing
Check CloudWatch logs at `/ecs/spatial-tasks`. Ensure secrets are properly configured.

