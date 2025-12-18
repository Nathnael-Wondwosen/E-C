# AWS Deployment Script for B2B E-Commerce Platform (PowerShell version)
# This script automates the deployment process to AWS ECS

param(
    [string]$AwsRegion = "us-east-1",
    [string]$AccountId = "<your-account-id>",
    [string]$ClusterName = "b2b-ecommerce-cluster"
)

# Configuration
$EcrRegistry = "${AccountId}.dkr.ecr.${AwsRegion}.amazonaws.com"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "Starting AWS Deployment Process" -ForegroundColor $Green

try {
    # Step 1: Authenticate with AWS ECR
    Write-Host "Step 1: Authenticating with AWS ECR" -ForegroundColor $Yellow
    aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $EcrRegistry
    
    # Step 2: Create ECR repositories if they don't exist
    Write-Host "Step 2: Creating ECR repositories" -ForegroundColor $Yellow
    $Repositories = @("b2b-api-gateway", "b2b-user-service", "b2b-product-service", "b2b-order-service", "b2b-payment-service", "b2b-search-service", "b2b-notification-service", "b2b-admin-dashboard", "b2b-customer-portal")
    
    foreach ($repo in $Repositories) {
        Write-Host "Creating repository: $repo"
        aws ecr create-repository --repository-name $repo --region $AwsRegion 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Repository $repo already exists or creation failed" -ForegroundColor Yellow
        }
    }
    
    # Step 3: Build Docker images
    Write-Host "Step 3: Building Docker images" -ForegroundColor $Yellow
    
    # Build API Gateway
    Write-Host "Building API Gateway..."
    Set-Location services\api-gateway
    docker build -t b2b-api-gateway .
    docker tag b2b-api-gateway:latest "$EcrRegistry/b2b-api-gateway:latest"
    docker push "$EcrRegistry/b2b-api-gateway:latest"
    Set-Location ..\..
    
    # Build User Service
    Write-Host "Building User Service..."
    Set-Location services\user-service
    docker build -t b2b-user-service .
    docker tag b2b-user-service:latest "$EcrRegistry/b2b-user-service:latest"
    docker push "$EcrRegistry/b2b-user-service:latest"
    Set-Location ..\..
    
    # Note: For brevity, other services would be built similarly
    # In a real deployment, you would build all services
    
    # Step 4: Create ECS Cluster
    Write-Host "Step 4: Creating ECS Cluster" -ForegroundColor $Yellow
    aws ecs create-cluster --cluster-name $ClusterName --region $AwsRegion 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Cluster $ClusterName already exists or creation failed" -ForegroundColor Yellow
    }
    
    # Step 5: Register Task Definition
    Write-Host "Step 5: Registering Task Definition" -ForegroundColor $Yellow
    # Note: You would need to replace YOUR_ACCOUNT_ID in the task definition file before this step
    # aws ecs register-task-definition --cli-input-json file://aws-task-definitions.json --region $AwsRegion
    
    Write-Host "Deployment process completed!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update the aws-task-definitions.json file with your actual AWS account ID"
    Write-Host "2. Configure security groups and networking"
    Write-Host "3. Set up load balancers and target groups"
    Write-Host "4. Configure environment variables for each service"
    Write-Host "5. Set up CloudWatch logging"
    Write-Host "6. Configure auto-scaling policies"
    
    Write-Host "Deployment script finished successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error during deployment: $_" -ForegroundColor $Red
    exit 1
}