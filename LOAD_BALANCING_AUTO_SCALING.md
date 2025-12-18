# Load Balancing and Auto Scaling Configuration for AWS

This document details the load balancing and auto-scaling configuration for the B2B E-Commerce Platform on AWS, ensuring high availability, fault tolerance, and optimal resource utilization.

## Load Balancing Architecture

### Application Load Balancer (ALB) Configuration

#### Listener Configuration
- **HTTP Listener**: Port 80 with redirect to HTTPS
- **HTTPS Listener**: Port 443 with SSL/TLS termination
- **SSL Certificate**: AWS Certificate Manager (ACM) managed certificates
- **Protocols**: HTTP/2 support enabled for better performance

#### Target Groups
1. **API Gateway Target Group**
   - Port: 3000
   - Health Check Path: `/health`
   - Health Check Interval: 30 seconds
   - Healthy Threshold: 2 consecutive successes
   - Unhealthy Threshold: 3 consecutive failures

2. **Admin Dashboard Target Group**
   - Port: 3000
   - Health Check Path: `/health`
   - Health Check Interval: 30 seconds
   - Healthy Threshold: 2 consecutive successes
   - Unhealthy Threshold: 3 consecutive failures

3. **Customer Portal Target Group**
   - Port: 3005
   - Health Check Path: `/health`
   - Health Check Interval: 30 seconds
   - Healthy Threshold: 2 consecutive successes
   - Unhealthy Threshold: 3 consecutive failures

#### Routing Rules
```json
[
  {
    "priority": 100,
    "conditions": [
      {
        "field": "path-pattern",
        "values": ["/api/*"]
      }
    ],
    "actions": [
      {
        "type": "forward",
        "target_group_arn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/api-gateway-tg/abcdef123456"
      }
    ]
  },
  {
    "priority": 200,
    "conditions": [
      {
        "field": "path-pattern",
        "values": ["/admin/*"]
      }
    ],
    "actions": [
      {
        "type": "forward",
        "target_group_arn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/admin-dashboard-tg/abcdef123456"
      }
    ]
  },
  {
    "priority": 300,
    "conditions": [
      {
        "field": "path-pattern",
        "values": ["/*"]
      }
    ],
    "actions": [
      {
        "type": "forward",
        "target_group_arn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/customer-portal-tg/abcdef123456"
      }
    ]
  }
]
```

### Health Checks Configuration

#### API Gateway Health Check
```bash
# HTTP Method: GET
# Protocol: HTTP
# Port: 3000
# Path: /health
# Success Codes: 200
# Timeout: 5 seconds
# Interval: 30 seconds
# Healthy Threshold: 2
# Unhealthy Threshold: 3
```

#### Service-Specific Health Checks
Each microservice implements a `/health` endpoint that returns:
```json
{
  "status": "OK",
  "service": "service-name",
  "timestamp": "ISO-8601-timestamp",
  "version": "service-version",
  "dependencies": {
    "mongodb": "OK",
    "redis": "OK",
    "external-api": "OK"
  }
}
```

### Cross-Zone Load Balancing
- **Enabled**: Yes, for even distribution across AZs
- **Stickiness**: Disabled for API services, enabled for session-dependent services with appropriate cookie names

## Auto Scaling Configuration

### ECS Service Auto Scaling

#### API Gateway Service Scaling
```json
{
  "ScalableDimension": "ecs:service:DesiredCount",
  "ResourceId": "service/b2b-cluster/api-gateway-service",
  "MinCapacity": 2,
  "MaxCapacity": 20,
  "ScalingPolicies": [
    {
      "PolicyName": "api-gateway-scale-out",
      "PolicyType": "TargetTrackingScaling",
      "TargetTrackingScalingPolicyConfiguration": {
        "TargetValue": 70.0,
        "PredefinedMetricSpecification": {
          "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleOutCooldown": 60,
        "ScaleInCooldown": 300
      }
    }
  ]
}
```

#### User Service Scaling
```json
{
  "ScalableDimension": "ecs:service:DesiredCount",
  "ResourceId": "service/b2b-cluster/user-service",
  "MinCapacity": 2,
  "MaxCapacity": 10,
  "ScalingPolicies": [
    {
      "PolicyName": "user-service-scale-out",
      "PolicyType": "TargetTrackingScaling",
      "TargetTrackingScalingPolicyConfiguration": {
        "TargetValue": 75.0,
        "PredefinedMetricSpecification": {
          "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleOutCooldown": 60,
        "ScaleInCooldown": 300
      }
    }
  ]
}
```

### Database Auto Scaling

#### MongoDB Atlas Auto Scaling
For MongoDB Atlas deployments:
- **Cluster Tier**: M10+ for auto-scaling capabilities
- **Disk IOPS**: Automatically scaled based on workload
- **RAM**: Dynamically allocated based on working set size
- **CPU**: Horizontally scaled with cluster size

### Frontend Auto Scaling

#### Admin Dashboard Scaling
```json
{
  "ScalableDimension": "ecs:service:DesiredCount",
  "ResourceId": "service/b2b-cluster/admin-dashboard",
  "MinCapacity": 1,
  "MaxCapacity": 5,
  "ScalingPolicies": [
    {
      "PolicyName": "admin-dashboard-scale-out",
      "PolicyType": "TargetTrackingScaling",
      "TargetTrackingScalingPolicyConfiguration": {
        "TargetValue": 65.0,
        "PredefinedMetricSpecification": {
          "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleOutCooldown": 120,
        "ScaleInCooldown": 600
      }
    }
  ]
}
```

#### Customer Portal Scaling
```json
{
  "ScalableDimension": "ecs:service:DesiredCount",
  "ResourceId": "service/b2b-cluster/customer-portal",
  "MinCapacity": 3,
  "MaxCapacity": 30,
  "ScalingPolicies": [
    {
      "PolicyName": "customer-portal-scale-out",
      "PolicyType": "TargetTrackingScaling",
      "TargetTrackingScalingPolicyConfiguration": {
        "TargetValue": 70.0,
        "PredefinedMetricSpecification": {
          "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleOutCooldown": 60,
        "ScaleInCooldown": 300
      }
    }
  ]
}
```

## Scaling Metrics and Thresholds

### Primary Scaling Metrics

#### CPU Utilization
- **Scale Out Threshold**: 70% average CPU utilization
- **Scale In Threshold**: 30% average CPU utilization
- **Evaluation Period**: 2 consecutive 1-minute periods

#### Memory Utilization
- **Scale Out Threshold**: 75% average memory utilization
- **Scale In Threshold**: 35% average memory utilization
- **Evaluation Period**: 3 consecutive 1-minute periods

#### Request Count
- **Scale Out Threshold**: 1000 requests per minute per task
- **Scale In Threshold**: 200 requests per minute per task
- **Evaluation Period**: 5 consecutive 1-minute periods

### Custom Metrics

#### Application-Level Metrics
- **Response Time**: Average response time > 2 seconds triggers scale-out
- **Error Rate**: Error rate > 5% triggers investigation
- **Concurrent Users**: Active user sessions for frontend services

#### Business Metrics
- **Order Processing Rate**: Orders per minute for order service
- **Search Requests**: Search queries per minute for search service
- **Payment Transactions**: Payment processing volume

## Auto Scaling Policies

### Scale-Out Policies
- **Trigger**: Metric threshold exceeded for specified duration
- **Action**: Increase desired count by 25% (minimum 1 task)
- **Cooldown**: 60 seconds before another scale-out event
- **Maximum Step**: Double current capacity (subject to MaxCapacity)

### Scale-In Policies
- **Trigger**: Metric below threshold for extended duration
- **Action**: Decrease desired count by 20% (minimum 1 task)
- **Cooldown**: 300 seconds before another scale-in event
- **Protection**: Scale-in protection for tasks younger than 5 minutes

### Scheduled Scaling
- **Peak Hours**: Pre-scheduled capacity increases for known high-traffic periods
- **Off-Peak Hours**: Reduced capacity during low-traffic periods
- **Special Events**: Temporary capacity adjustments for promotions or events

```json
{
  "ScheduledActions": [
    {
      "ScheduledActionName": "business-hours-scale-up",
      "Schedule": "cron(0 9 * * MON-FRI)",
      "TargetCapacity": 10,
      "MinSize": 5,
      "MaxSize": 25
    },
    {
      "ScheduledActionName": "business-hours-scale-down",
      "Schedule": "cron(0 18 * * MON-FRI)",
      "TargetCapacity": 5,
      "MinSize": 2,
      "MaxSize": 20
    }
  ]
}
```

## Load Testing and Validation

### Pre-Deployment Testing
- **Baseline Performance**: Establish baseline metrics with current capacity
- **Stress Testing**: Simulate 2x expected peak load
- **Failure Scenarios**: Test service degradation and recovery
- **Health Check Validation**: Verify health check reliability

### Post-Deployment Monitoring
- **Gradual Rollout**: Implement canary deployments with gradual traffic increase
- **Real-time Metrics**: Monitor scaling events and their impact
- **Alert Configuration**: Set up notifications for scaling activities
- **Performance Validation**: Confirm service level agreements are met

## Failover and Redundancy

### Multi-AZ Deployment
- **Availability Zones**: Minimum 2 AZs for all services
- **Load Distribution**: Even distribution across AZs
- **Failure Isolation**: AZ-level failure containment
- **Automatic Failover**: Seamless redirection during AZ outages

### Regional Redundancy
- **Primary Region**: us-east-1 (N. Virginia)
- **Secondary Region**: us-west-2 (Oregon)
- **Data Replication**: Cross-region database replication
- **DNS Failover**: Route 53 health checks and failover routing

## Cost Optimization

### Right-Sizing
- **Continuous Monitoring**: Regular review of resource utilization
- **Instance Types**: Optimize for workload characteristics
- **Spot Instances**: Use for fault-tolerant batch processing workloads
- **Fargate Sizes**: Select appropriate CPU/memory combinations

### Reserved Capacity
- **Predictable Workloads**: Reserve capacity for steady-state services
- **Savings Plans**: Commit to compute spend for discounts
- **Convertible RIs**: Flexibility for changing instance types

### Auto Scaling Boundaries
- **Minimum Capacity**: Balance availability with cost
- **Maximum Capacity**: Prevent runaway scaling costs
- **Scheduled Scaling**: Reduce off-peak capacity

## Monitoring and Alerting

### Scaling Events
- **Notification**: SNS alerts for all scaling activities
- **Logging**: Detailed logs of scaling decisions and outcomes
- **Metrics**: Publish custom metrics for scaling effectiveness

### Performance Impact
- **Latency Monitoring**: Track response time during scaling events
- **Error Rates**: Monitor for increased errors during transitions
- **Capacity Planning**: Long-term trend analysis for future scaling

This load balancing and auto-scaling configuration ensures the B2B E-Commerce Platform can handle varying loads while maintaining performance, availability, and cost-effectiveness on AWS.