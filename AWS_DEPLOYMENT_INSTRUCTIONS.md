# AWS Deployment Instructions for B2B E-Commerce Platform

This document provides step-by-step instructions for deploying the B2B E-Commerce Platform on AWS.

## Prerequisites

1. **AWS Account** - You need an active AWS account
2. **AWS CLI** - Install and configure the AWS Command Line Interface
3. **Docker** - Install Docker Desktop
4. **Node.js** - Install Node.js 18.x or later

## Step 1: Install and Configure AWS CLI

1. Download and install AWS CLI from https://aws.amazon.com/cli/
2. Configure your AWS credentials:
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Default output format (json)

## Step 2: Set Up AWS Environment

Run the environment setup script:
```powershell
.\setup-aws-environment.ps1 -AccountId "YOUR_AWS_ACCOUNT_ID" -AwsRegion "us-east-1"
```

This script will:
- Create ECR repositories for all services
- Create an ECS cluster
- Set up CloudWatch log groups

## Step 3: Build and Deploy Docker Images

Run the complete deployment script:
```powershell
.\complete-aws-deployment.ps1 -AccountId "YOUR_AWS_ACCOUNT_ID" -AwsRegion "us-east-1"
```

This script will:
- Build Docker images for all services
- Push images to ECR repositories

## Step 4: Manual AWS Configuration

After running the scripts, you'll need to manually complete the following steps:

### 4.1: Register Task Definition
```bash
aws ecs register-task-definition --cli-input-json file://aws-task-definitions-updated.json --region us-east-1
```

### 4.2: Create ECS Services
Create services for each container in your ECS cluster using the AWS Management Console or CLI.

### 4.3: Configure Load Balancer
Set up an Application Load Balancer with target groups for each service.

### 4.4: Configure Security Groups
Create security groups to control inbound and outbound traffic.

### 4.5: Set Up IAM Roles
Ensure proper IAM roles are configured for ECS tasks and services.

### 4.6: Configure Environment Variables
Set environment variables for each service in the ECS task definitions.

## Environment Variables

Each service requires specific environment variables. See `.env.aws.template` for a complete list.

## Monitoring and Logging

The deployment includes CloudWatch logging for all services. You can monitor your services through the AWS CloudWatch console.

## Security Best Practices

1. Use IAM roles with least privilege
2. Enable encryption for data at rest and in transit
3. Regularly update and patch your services
4. Implement proper network segmentation

## Scaling

The architecture supports auto-scaling. Configure scaling policies based on CPU and memory utilization.

## Backup and Recovery

Regular backups of the MongoDB database should be configured using AWS backup services.

## Troubleshooting

Common issues and solutions:
1. **Authentication errors** - Verify AWS credentials
2. **Permission errors** - Check IAM roles and policies
3. **Network connectivity** - Verify security groups and VPC configuration
4. **Service deployment failures** - Check CloudWatch logs for error details

## Cost Management

Monitor your AWS costs regularly and optimize resource usage:
1. Use appropriate instance types
2. Implement auto-scaling
3. Use spot instances where appropriate
4. Regularly review and optimize resource allocation