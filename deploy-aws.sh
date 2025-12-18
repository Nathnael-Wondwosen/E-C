#!/bin/bash

# AWS Deployment Script for B2B E-Commerce Platform
# This script automates the deployment process to AWS ECS

set -e  # Exit on any error

# Configuration
AWS_REGION="us-east-1"
ECR_REGISTRY="<your-account-id>.dkr.ecr.${AWS_REGION}.amazonaws.com"
CLUSTER_NAME="b2b-ecommerce-cluster"
SERVICE_NAME="b2b-ecommerce-service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS Deployment Process${NC}"

# Step 1: Authenticate with AWS ECR
echo -e "${YELLOW}Step 1: Authenticating with AWS ECR${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Step 2: Create ECR repositories if they don't exist
echo -e "${YELLOW}Step 2: Creating ECR repositories${NC}"
REPOSITORIES=("b2b-api-gateway" "b2b-user-service" "b2b-product-service" "b2b-order-service" "b2b-payment-service" "b2b-search-service" "b2b-notification-service" "b2b-admin-dashboard" "b2b-customer-portal")

for repo in "${REPOSITORIES[@]}"; do
  echo "Creating repository: $repo"
  aws ecr create-repository --repository-name $repo --region ${AWS_REGION} || echo "Repository $repo already exists"
done

# Step 3: Build Docker images
echo -e "${YELLOW}Step 3: Building Docker images${NC}"

# Build API Gateway
echo "Building API Gateway..."
cd services/api-gateway
docker build -t b2b-api-gateway .
docker tag b2b-api-gateway:latest ${ECR_REGISTRY}/b2b-api-gateway:latest
docker push ${ECR_REGISTRY}/b2b-api-gateway:latest
cd ../..

# Build User Service
echo "Building User Service..."
cd services/user-service
docker build -t b2b-user-service .
docker tag b2b-user-service:latest ${ECR_REGISTRY}/b2b-user-service:latest
docker push ${ECR_REGISTRY}/b2b-user-service:latest
cd ../..

# Note: For brevity, other services would be built similarly
# In a real deployment, you would build all services

# Step 4: Create ECS Cluster
echo -e "${YELLOW}Step 4: Creating ECS Cluster${NC}"
aws ecs create-cluster --cluster-name ${CLUSTER_NAME} --region ${AWS_REGION} || echo "Cluster ${CLUSTER_NAME} already exists"

# Step 5: Register Task Definition
echo -e "${YELLOW}Step 5: Registering Task Definition${NC}"
# Note: You would need to replace YOUR_ACCOUNT_ID in the task definition file before this step
aws ecs register-task-definition --cli-input-json file://aws-task-definitions.json --region ${AWS_REGION}

# Step 6: Create ECS Service
echo -e "${YELLOW}Step 6: Creating ECS Service${NC}"
# This is a simplified example - in practice, you would need to specify more parameters
# including security groups, subnets, load balancer configuration, etc.

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update the aws-task-definitions.json file with your actual AWS account ID"
echo "2. Configure security groups and networking"
echo "3. Set up load balancers and target groups"
echo "4. Configure environment variables for each service"
echo "5. Set up CloudWatch logging"
echo "6. Configure auto-scaling policies"

echo -e "${GREEN}Deployment script finished successfully!${NC}"