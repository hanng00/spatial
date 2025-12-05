#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Spatial Deployment Script ===${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: Could not get AWS account ID. Is AWS CLI configured?${NC}"
    exit 1
fi

echo -e "AWS Account: ${YELLOW}${AWS_ACCOUNT_ID}${NC}"
echo -e "AWS Region: ${YELLOW}${AWS_REGION}${NC}"

# ECR registry URL
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Function to build and push image
build_and_push() {
    local name=$1
    local dockerfile=$2
    local repo=$3
    
    echo -e "\n${GREEN}Building ${name}...${NC}"
    docker build -f ${dockerfile} -t ${name}:latest .
    
    echo -e "${GREEN}Tagging ${name}...${NC}"
    docker tag ${name}:latest ${ECR_REGISTRY}/${repo}:latest
    
    echo -e "${GREEN}Pushing ${name}...${NC}"
    docker push ${ECR_REGISTRY}/${repo}:latest
}

case "${1:-all}" in
    infra)
        echo -e "\n${GREEN}=== Deploying Infrastructure ===${NC}"
        cd infra
        bun install
        bun run deploy
        ;;
    
    images)
        echo -e "\n${GREEN}=== Building and Pushing Images ===${NC}"
        
        # Login to ECR
        echo -e "${GREEN}Logging in to ECR...${NC}"
        aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin ${ECR_REGISTRY}
        
        # Build and push all images
        build_and_push "spatial/ingestion" "ingestion/Dockerfile" "spatial/ingestion"
        build_and_push "spatial/transformations-dbt" "transformations_dbt/Dockerfile" "spatial/transformations-dbt"
        build_and_push "spatial/dagster" "orchestration_dagster/Dockerfile.apprunner" "spatial/dagster"
        
        echo -e "\n${GREEN}All images pushed successfully!${NC}"
        ;;
    
    secrets)
        echo -e "\n${GREEN}=== Configuring Secrets ===${NC}"
        
        if [ -z "$MOTHERDUCK_ACCESS_TOKEN" ]; then
            echo -e "${RED}Error: MOTHERDUCK_ACCESS_TOKEN environment variable not set${NC}"
            exit 1
        fi
        
        read -p "Enter Dagster basic auth username [admin]: " DAGSTER_USER
        DAGSTER_USER=${DAGSTER_USER:-admin}
        
        read -sp "Enter Dagster basic auth password: " DAGSTER_PASS
        echo
        
        if [ -z "$DAGSTER_PASS" ]; then
            echo -e "${RED}Error: Password cannot be empty${NC}"
            exit 1
        fi
        
        # Update worker secrets
        echo -e "${GREEN}Updating spatial/secrets...${NC}"
        aws secretsmanager put-secret-value \
            --secret-id spatial/secrets \
            --secret-string "{\"MOTHERDUCK_ACCESS_TOKEN\":\"${MOTHERDUCK_ACCESS_TOKEN}\",\"DATABASE_NAME\":\"spatial_dagster\"}" \
            --region ${AWS_REGION}
        
        # Update Dagster secrets
        echo -e "${GREEN}Updating spatial/dagster-secrets...${NC}"
        aws secretsmanager put-secret-value \
            --secret-id spatial/dagster-secrets \
            --secret-string "{\"BASIC_AUTH_USERNAME\":\"${DAGSTER_USER}\",\"BASIC_AUTH_PASSWORD\":\"${DAGSTER_PASS}\",\"MOTHERDUCK_ACCESS_TOKEN\":\"${MOTHERDUCK_ACCESS_TOKEN}\",\"DATABASE_NAME\":\"spatial_dagster\"}" \
            --region ${AWS_REGION}
        
        echo -e "${GREEN}Secrets updated successfully!${NC}"
        ;;
    
    all)
        echo -e "\n${YELLOW}=== Full Deployment ===${NC}"
        echo "This will:"
        echo "  1. Deploy CDK infrastructure"
        echo "  2. Build and push Docker images"
        echo "  3. Configure secrets"
        echo ""
        read -p "Continue? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
        
        $0 infra
        $0 images
        $0 secrets
        
        echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Get Dagster URL from CDK outputs"
        echo "  2. Wait ~2-3 minutes for App Runner to deploy"
        echo "  3. Access Dagster UI (cold start may take 60-90s)"
        ;;
    
    *)
        echo "Usage: $0 {infra|images|secrets|all}"
        echo ""
        echo "Commands:"
        echo "  infra   - Deploy CDK infrastructure only"
        echo "  images  - Build and push Docker images to ECR"
        echo "  secrets - Configure secrets in AWS Secrets Manager"
        echo "  all     - Full deployment (infra + images + secrets)"
        exit 1
        ;;
esac

