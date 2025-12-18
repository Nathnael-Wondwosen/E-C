# AWS Deployment Guide for B2B E-Commerce Platform

This guide provides instructions for deploying the B2B E-Commerce Platform on AWS using Docker containers and ECS (Elastic Container Service).

## Architecture Overview

The platform consists of the following microservices:

1. **Frontend Applications**
   - Admin Dashboard (Next.js)
   - Customer Portal (Next.js)

2. **Backend Services**
   - API Gateway (Express.js)
   - User Service (Express.js)
   - Product Service (Express.js)
   - Order Service (Express.js)
   - Payment Service (Express.js)
   - Search Service (Express.js)
   - Notification Service (Express.js)

3. **Database**
   - MongoDB

## Prerequisites

- AWS Account
- AWS CLI configured
- Docker installed locally
- Node.js 18.x

## Deployment Options

### Option 1: Using AWS ECS with Docker Compose

1. **Build and Push Docker Images**
   ```bash
   # Login to AWS ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build images
   docker-compose -f docker-compose.aws.yml build
   
   # Tag and push images to ECR
   docker tag b2becommerce_api-gateway:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/b2b-api-gateway:latest
   docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/b2b-api-gateway:latest
   
   # Repeat for all services...
   ```

2. **Deploy to ECS**
   - Create ECS cluster
   - Create task definitions for each service
   - Create services in ECS cluster
   - Configure load balancer and target groups

### Option 2: Using AWS Elastic Beanstalk

1. **Prepare Application Bundles**
   ```bash
   # Create zip bundles for each service
   cd services/api-gateway
   zip -r ../api-gateway.zip . -x "*.git*" "node_modules/*" "*.env"
   ```

2. **Deploy to Elastic Beanstalk**
   - Create separate EB environments for each service
   - Upload application bundles
   - Configure environment variables

## Infrastructure Requirements

### Network Configuration
- VPC with public and private subnets
- Internet Gateway for public access
- NAT Gateway for private subnet internet access
- Security Groups for each service

### Load Balancing
- Application Load Balancer (ALB) for HTTP/HTTPS traffic
- Target groups for each service
- SSL certificate for HTTPS

### Database
- Amazon DocumentDB or MongoDB Atlas for production
- Enable backups and monitoring

### Storage
- Amazon S3 for static assets and file uploads
- CloudFront CDN for content delivery

## Environment Variables

Each service requires specific environment variables:

### API Gateway
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret
CLOUDINARY_URL=your-cloudinary-url
```

### User Service
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-jwt-secret
```

### Other Services
Similar pattern with service-specific configurations.

## Monitoring and Logging

### CloudWatch
- Set up alarms for CPU, memory, and disk usage
- Monitor application logs
- Track API response times

### Health Checks
- Implement health check endpoints for each service
- Configure load balancer health checks

## Security Best Practices

1. **Network Security**
   - Restrict inbound/outbound traffic with security groups
   - Use private subnets for database services
   - Enable VPC flow logs

2. **Data Protection**
   - Encrypt data at rest and in transit
   - Use AWS KMS for key management
   - Regular database backups

3. **Application Security**
   - Implement rate limiting
   - Validate and sanitize all inputs
   - Use helmet.js for Express applications
   - Regular security updates

## Scaling Strategy

### Auto Scaling
- Configure CPU-based auto scaling for ECS services
- Set minimum and maximum task counts
- Define scaling policies

### Database Scaling
- Use read replicas for high-read workloads
- Implement sharding for large datasets
- Monitor connection pools

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to AWS ECS
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: b2b-api-gateway
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster b2b-cluster --service api-gateway-service --force-new-deployment
```

## Backup and Disaster Recovery

1. **Database Backups**
   - Automated daily backups
   - Point-in-time recovery enabled
   - Cross-region backup copies

2. **Application Backups**
   - Version-controlled Docker images
   - Configuration backups in AWS Systems Manager Parameter Store
   - Regular snapshot of EBS volumes

## Cost Optimization

1. **Right-sizing**
   - Monitor resource utilization
   - Adjust instance types and task sizes
   - Use Spot Instances for non-critical workloads

2. **Storage Optimization**
   - Lifecycle policies for S3 objects
   - Intelligent-Tiering for infrequently accessed data
   - Compress and deduplicate data

## Troubleshooting

### Common Issues

1. **Service Connectivity**
   - Check security group rules
   - Verify VPC routing tables
   - Confirm service discovery configuration

2. **Database Connection**
   - Validate connection string
   - Check network ACLs
   - Ensure database is accepting connections

3. **Deployment Failures**
   - Review CloudFormation events
   - Check ECS task logs
   - Validate Docker image availability

## Maintenance

1. **Regular Updates**
   - Schedule maintenance windows
   - Update base Docker images
   - Apply security patches

2. **Performance Tuning**
   - Monitor application metrics
   - Optimize database queries
   - Adjust auto-scaling parameters

This deployment guide provides a foundation for running your B2B E-Commerce Platform on AWS with high availability, scalability, and security.