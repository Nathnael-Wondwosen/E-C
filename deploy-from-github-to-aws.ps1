# AWS Deployment Script - Pull from GitHub and Deploy to AWS
# This script pulls the latest code from GitHub and deploys to AWS ECS

param(
    [string]$AwsRegion = "us-east-1",
    [string]$AccountId,
    [string]$ClusterName = "b2b-ecommerce-cluster",
    [string]$GitHubRepo = "git@github.com:Nathnael-Wondwosen/E-C.git",
    [string]$Branch = "main"
)

# Validate parameters
if (-not $AccountId -or $AccountId -eq "<your-account-id>" -or $AccountId -eq "YOUR_ACTUAL_ACCOUNT_ID") {
    Write-Host "Please provide your AWS Account ID as a parameter:" -ForegroundColor Red
    Write-Host "Example: .\deploy-from-github-to-aws.ps1 -AccountId ""123456789012""" -ForegroundColor Yellow
    exit 1
}

# Configuration
$EcrRegistry = "${AccountId}.dkr.ecr.${AwsRegion}.amazonaws.com"
$TempDir = "temp-deployment"

Write-Host "Starting GitHub to AWS Deployment Process" -ForegroundColor Green
Write-Host "Account ID: $AccountId" -ForegroundColor Cyan
Write-Host "Region: $AwsRegion" -ForegroundColor Cyan
Write-Host "ECR Registry: $EcrRegistry" -ForegroundColor Cyan
Write-Host "GitHub Repo: $GitHubRepo" -ForegroundColor Cyan
Write-Host "Branch: $Branch" -ForegroundColor Cyan

try {
    # Step 1: Create temporary directory and pull from GitHub
    Write-Host "`nStep 1: Cloning repository from GitHub" -ForegroundColor Yellow
    if (Test-Path $TempDir) {
        Remove-Item -Recurse -Force $TempDir
    }
    New-Item -ItemType Directory -Name $TempDir
    Set-Location $TempDir
    git clone $GitHubRepo .
    git checkout $Branch
    
    # Step 2: Authenticate with AWS ECR
    Write-Host "Step 2: Authenticating with AWS ECR" -ForegroundColor Yellow
    aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $EcrRegistry
    
    # Step 3: Create ECR repositories if they don't exist
    Write-Host "Step 3: Creating ECR repositories" -ForegroundColor Yellow
    $Repositories = @("b2b-api-gateway", "b2b-user-service", "b2b-product-service", "b2b-order-service", "b2b-payment-service", "b2b-search-service", "b2b-notification-service", "b2b-admin-dashboard", "b2b-customer-portal")
    
    foreach ($repo in $Repositories) {
        Write-Host "Creating repository: $repo" -ForegroundColor Cyan
        aws ecr create-repository --repository-name $repo --region $AwsRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Repository $repo created successfully" -ForegroundColor Green
        } else {
            Write-Host "  Repository $repo already exists" -ForegroundColor Yellow
        }
    }
    
    # Step 4: Build and Push Docker Images
    Write-Host "Step 4: Building and Pushing Docker Images" -ForegroundColor Yellow
    
    # Build and push API Gateway
    Write-Host "Building and pushing API Gateway..." -ForegroundColor Cyan
    if (Test-Path services\api-gateway) {
        Set-Location services\api-gateway
        docker build -t b2b-api-gateway .
        docker tag b2b-api-gateway:latest "$EcrRegistry/b2b-api-gateway:latest"
        docker push "$EcrRegistry/b2b-api-gateway:latest"
        Set-Location ..\..
    } else {
        Write-Host "  API Gateway service not found, skipping..." -ForegroundColor Yellow
    }
    
    # Build and push User Service
    Write-Host "Building and pushing User Service..." -ForegroundColor Cyan
    if (Test-Path services\user-service) {
        Set-Location services\user-service
        docker build -t b2b-user-service .
        docker tag b2b-user-service:latest "$EcrRegistry/b2b-user-service:latest"
        docker push "$EcrRegistry/b2b-user-service:latest"
        Set-Location ..\..
    } else {
        Write-Host "  User Service not found, skipping..." -ForegroundColor Yellow
    }
    
    # Build and push Admin Dashboard
    Write-Host "Building and pushing Admin Dashboard..." -ForegroundColor Cyan
    if (Test-Path frontend\admin-dashboard) {
        Set-Location frontend\admin-dashboard
        docker build -t b2b-admin-dashboard .
        docker tag b2b-admin-dashboard:latest "$EcrRegistry/b2b-admin-dashboard:latest"
        docker push "$EcrRegistry/b2b-admin-dashboard:latest"
        Set-Location ..\..
    } else {
        Write-Host "  Admin Dashboard not found, skipping..." -ForegroundColor Yellow
    }
    
    # Build and push Customer Portal
    Write-Host "Building and pushing Customer Portal..." -ForegroundColor Cyan
    if (Test-Path frontend\customer-portal) {
        Set-Location frontend\customer-portal
        docker build -t b2b-customer-portal .
        docker tag b2b-customer-portal:latest "$EcrRegistry/b2b-customer-portal:latest"
        docker push "$EcrRegistry/b2b-customer-portal:latest"
        Set-Location ..\..
    } else {
        Write-Host "  Customer Portal not found, skipping..." -ForegroundColor Yellow
    }
    
    # Step 5: Create ECS Cluster
    Write-Host "Step 5: Creating ECS Cluster" -ForegroundColor Yellow
    aws ecs create-cluster --cluster-name $ClusterName --region $AwsRegion 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cluster $ClusterName created successfully" -ForegroundColor Green
    } else {
        Write-Host "Cluster $ClusterName already exists" -ForegroundColor Yellow
    }
    
    # Step 6: Update Task Definition with Actual Account ID
    Write-Host "Step 6: Updating Task Definition" -ForegroundColor Yellow
    if (Test-Path aws-task-definitions.json) {
        $taskDefContent = Get-Content aws-task-definitions.json -Raw
        $taskDefContent = $taskDefContent -replace "YOUR_ACTUAL_ACCOUNT_ID", $AccountId
        $taskDefContent | Set-Content aws-task-definitions-updated.json
        
        Write-Host "Task definition updated successfully" -ForegroundColor Green
    } else {
        Write-Host "Task definition file not found, skipping..." -ForegroundColor Yellow
    }
    
    # Step 7: Clean up
    Write-Host "Step 7: Cleaning up temporary files" -ForegroundColor Yellow
    Set-Location ..
    Remove-Item -Recurse -Force $TempDir
    
    Write-Host "`nDeployment process completed!" -ForegroundColor Green
    Write-Host "Summary of deployed services:" -ForegroundColor Yellow
    Write-Host "- API Gateway: $EcrRegistry/b2b-api-gateway:latest" -ForegroundColor Cyan
    Write-Host "- User Service: $EcrRegistry/b2b-user-service:latest" -ForegroundColor Cyan
    Write-Host "- Admin Dashboard: $EcrRegistry/b2b-admin-dashboard:latest" -ForegroundColor Cyan
    Write-Host "- Customer Portal: $EcrRegistry/b2b-customer-portal:latest" -ForegroundColor Cyan
    
    Write-Host "`nNext manual steps:" -ForegroundColor Yellow
    Write-Host "1. Register the task definition using AWS CLI:" -ForegroundColor Cyan
    Write-Host "   aws ecs register-task-definition --cli-input-json file://aws-task-definitions-updated.json --region $AwsRegion" -ForegroundColor White
    Write-Host "2. Create services in ECS cluster" -ForegroundColor Cyan
    Write-Host "3. Configure load balancer and networking" -ForegroundColor Cyan
    Write-Host "4. Set up security groups and IAM roles" -ForegroundColor Cyan
    Write-Host "5. Configure environment variables for each service" -ForegroundColor Cyan
    Write-Host "6. Set up auto-scaling policies" -ForegroundColor Cyan
    
    Write-Host "`nDeployment script finished successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    # Clean up on error
    Set-Location ..
    if (Test-Path $TempDir) {
        Remove-Item -Recurse -Force $TempDir
    }
    exit 1
}