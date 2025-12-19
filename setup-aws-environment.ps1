# AWS Environment Setup Script for B2B E-Commerce Platform
# This script sets up the basic AWS environment for deployment

param(
    [string]$AwsRegion = "us-east-1",
    [string]$AccountId,
    [string]$ClusterName = "Tradethiopia"
)

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI is installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI is not installed. Please install it from https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# Validate account ID
if (-not $AccountId -or $AccountId -eq "967657494795") {
    Write-Host "Please provide your AWS Account ID as a parameter:" -ForegroundColor Yellow
    Write-Host "Example: .\setup-aws-environment.ps1 -AccountId ""967657494795""" -ForegroundColor Yellow
    exit 1
}

# Configuration
$EcrRegistry = "${AccountId}.dkr.ecr.${AwsRegion}.amazonaws.com"

Write-Host "Setting up AWS environment for B2B E-Commerce Platform" -ForegroundColor Green
Write-Host "Account ID: $AccountId" -ForegroundColor Cyan
Write-Host "Region: $AwsRegion" -ForegroundColor Cyan
Write-Host "ECR Registry: $EcrRegistry" -ForegroundColor Cyan

try {
    # Step 1: Authenticate with AWS ECR
    Write-Host "`nStep 1: Authenticating with AWS ECR" -ForegroundColor Yellow
    aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $EcrRegistry
    
    # Step 2: Create ECR repositories
    Write-Host "Step 2: Creating ECR repositories" -ForegroundColor Yellow
    $Repositories = @("b2b-api-gateway", "b2b-user-service", "b2b-product-service", "b2b-order-service", "b2b-payment-service", "b2b-search-service", "b2b-notification-service", "b2b-admin-dashboard", "b2b-customer-portal")
    
    foreach ($repo in $Repositories) {
        Write-Host "Creating repository: $repo" -ForegroundColor Cyan
        aws ecr create-repository --repository-name $repo --region $AwsRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Repository $repo created successfully" -ForegroundColor Green
        } else {
            Write-Host "  Repository $repo already exists or creation failed" -ForegroundColor Yellow
        }
    }
    
    # Step 3: Create ECS Cluster
    Write-Host "Step 3: Creating ECS Cluster" -ForegroundColor Yellow
    aws ecs create-cluster --cluster-name $ClusterName --region $AwsRegion 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cluster $ClusterName created successfully" -ForegroundColor Green
    } else {
        Write-Host "Cluster $ClusterName already exists or creation failed" -ForegroundColor Yellow
    }
    
    # Step 4: Create CloudWatch Log Groups
    Write-Host "Step 4: Creating CloudWatch Log Groups" -ForegroundColor Yellow
    $LogGroups = @("/ecs/b2b-ecommerce/mongodb", "/ecs/b2b-ecommerce/api-gateway", "/ecs/b2b-ecommerce/user-service", "/ecs/b2b-ecommerce/product-service", "/ecs/b2b-ecommerce/order-service", "/ecs/b2b-ecommerce/payment-service", "/ecs/b2b-ecommerce/search-service", "/ecs/b2b-ecommerce/notification-service", "/ecs/b2b-ecommerce/admin-dashboard", "/ecs/b2b-ecommerce/customer-portal")
    
    foreach ($logGroup in $LogGroups) {
        Write-Host "Creating log group: $logGroup" -ForegroundColor Cyan
        aws logs create-log-group --log-group-name $logGroup --region $AwsRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Log group $logGroup created successfully" -ForegroundColor Green
        } else {
            Write-Host "  Log group $logGroup already exists or creation failed" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nAWS environment setup completed successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update the aws-task-definitions.json file with your actual AWS account ID" -ForegroundColor Cyan
    Write-Host "2. Build and push Docker images using the deploy-aws.ps1 script" -ForegroundColor Cyan
    Write-Host "3. Register the task definition" -ForegroundColor Cyan
    Write-Host "4. Create services in ECS cluster" -ForegroundColor Cyan
    Write-Host "5. Configure load balancer and networking" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error during setup: $_" -ForegroundColor Red
    exit 1
}