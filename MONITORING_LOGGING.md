# Monitoring and Logging Solution for AWS Deployment

This document outlines the comprehensive monitoring and logging solution for the B2B E-Commerce Platform on AWS, ensuring observability, performance optimization, and rapid incident response.

## Monitoring Architecture Overview

### AWS Monitoring Services
1. **Amazon CloudWatch**: Centralized metrics and logs
2. **AWS X-Ray**: Distributed tracing
3. **Amazon CloudWatch Synthetics**: Synthetic monitoring
4. **AWS CloudTrail**: API activity logging
5. **AWS Config**: Configuration tracking

### Third-Party Integrations
1. **Datadog/New Relic**: Enhanced APM capabilities
2. **Sentry**: Error tracking and alerting
3. **PagerDuty**: Incident management and on-call scheduling

## CloudWatch Metrics Configuration

### ECS Service Metrics

#### Container Insights
```json
{
  "Namespace": "ECS/ContainerInsights",
  "Metrics": [
    {
      "MetricName": "CPUUtilization",
      "Dimensions": [
        {
          "Name": "ClusterName",
          "Value": "b2b-ecommerce-cluster"
        },
        {
          "Name": "ServiceName",
          "Value": "api-gateway-service"
        }
      ],
      "Statistic": "Average",
      "Unit": "Percent"
    },
    {
      "MetricName": "MemoryUtilization",
      "Dimensions": [
        {
          "Name": "ClusterName",
          "Value": "b2b-ecommerce-cluster"
        },
        {
          "Name": "ServiceName",
          "Value": "api-gateway-service"
        }
      ],
      "Statistic": "Average",
      "Unit": "Percent"
    }
  ]
}
```

#### Custom Application Metrics
```javascript
// Example of publishing custom metrics from Node.js services
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

async function publishCustomMetric(metricName, value, dimensions) {
  const params = {
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: dimensions,
        Timestamp: new Date(),
        Unit: 'Count',
        Value: value
      }
    ],
    Namespace: 'B2B/ECommerce'
  };
  
  try {
    await cloudwatch.putMetricData(params).promise();
  } catch (error) {
    console.error('Error publishing metric:', error);
  }
}

// Usage examples
publishCustomMetric('OrdersPlaced', 1, [
  { Name: 'Service', Value: 'order-service' },
  { Name: 'Environment', Value: 'production' }
]);

publishCustomMetric('SearchRequests', 1, [
  { Name: 'Service', Value: 'search-service' },
  { Name: 'Environment', Value: 'production' }
]);
```

### Database Metrics

#### MongoDB/DocumentDB Metrics
- **CPUUtilization**: Database CPU usage
- **DatabaseConnections**: Active connections
- **ReadLatency**: Read operation latency
- **WriteLatency**: Write operation latency
- **FreeableMemory**: Available memory
- **SwapUsage**: Swap space utilization

### Network Metrics
- **NetworkIn/NetworkOut**: Traffic in/out of instances
- **HTTPCode_Target_2XX_Count**: Successful requests
- **HTTPCode_Target_4XX_Count**: Client errors
- **HTTPCode_Target_5XX_Count**: Server errors
- **TargetResponseTime**: Response time distribution

## Logging Configuration

### Structured Logging Implementation

#### Node.js Winston Logger Configuration
```javascript
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: process.env.SERVICE_NAME,
    version: process.env.SERVICE_VERSION,
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new CloudWatchTransport({
      logGroupName: `b2b-ecommerce-${process.env.SERVICE_NAME}`,
      logStreamName: `${process.env.NODE_ENV}-${Date.now()}`,
      awsRegion: process.env.AWS_REGION,
      jsonMessage: true,
      retentionInDays: 14
    })
  ]
});

module.exports = logger;
```

#### Log Levels and Structure
```json
{
  "timestamp": "2023-06-15T10:30:45.123Z",
  "level": "info",
  "message": "User login successful",
  "service": "user-service",
  "version": "1.2.3",
  "environment": "production",
  "userId": "user-123",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-abc-123"
}
```

### Log Retention Policies

#### CloudWatch Log Groups
- **Application Logs**: 30 days retention
- **Access Logs**: 90 days retention
- **Audit Logs**: 365 days retention
- **Debug Logs**: 7 days retention

#### S3 Archival
- **Frequency**: Daily export of logs to S3
- **Storage Class**: Intelligent-Tiering
- **Encryption**: SSE-KMS
- **Lifecycle**: Transition to Glacier after 90 days

### Log Aggregation and Analysis

#### CloudWatch Logs Insights Queries
```sql
-- Error rate analysis
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| stats count(*) as errorCount by bin(1h)
| sort @timestamp desc

-- API response time analysis
fields @timestamp, duration, statusCode, apiEndpoint
| filter ispresent(duration)
| stats avg(duration) as avgDuration, count(*) as requestCount by apiEndpoint
| sort avgDuration desc

-- User activity tracking
fields @timestamp, userId, action, ipAddress
| filter action = "login" or action = "logout"
| stats count(*) as sessionCount by userId, bin(1d)
```

## Distributed Tracing with AWS X-Ray

### X-Ray Instrumentation

#### Express.js Middleware
```javascript
const AWSXRay = require('aws-xray-sdk');
const express = require('express');
const app = express();

// Enable X-Ray middleware
app.use(AWSXRay.express.openSegment('APIGateway'));

// Your routes here
app.get('/api/users/:id', async (req, res) => {
  const segment = AWSXRay.getSegment();
  
  try {
    // Add annotations for filtering
    segment.addAnnotation('userId', req.params.id);
    segment.addAnnotation('endpoint', 'getUser');
    
    // Add metadata for debugging
    segment.addMetadata('requestHeaders', req.headers);
    
    // Make downstream calls with subsegments
    const subsegment = segment.addNewSubsegment('callUserService');
    try {
      const userData = await getUserFromService(req.params.id);
      subsegment.close();
      res.json(userData);
    } catch (error) {
      subsegment.addError(error);
      subsegment.close();
      throw error;
    }
  } catch (error) {
    segment.addError(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close X-Ray segment
app.use(AWSXRay.express.closeSegment());
```

#### Database Query Tracing
```javascript
const AWSXRay = require('aws-xray-sdk');
const { MongoClient } = require('mongodb');

// Wrap MongoDB client with X-Ray
const awsMongoClient = AWSXRay.captureMongoDB(MongoClient);

async function getUser(userId) {
  return AWSXRay.captureAsyncFunc('getUserFromDB', async (subsegment) => {
    try {
      subsegment.addAnnotation('userId', userId);
      
      const client = new awsMongoClient(process.env.MONGODB_URI);
      await client.connect();
      
      const db = client.db('ecommerce_platform');
      const user = await db.collection('users').findOne({ _id: userId });
      
      subsegment.addMetadata('result', user ? 'found' : 'not_found');
      return user;
    } catch (error) {
      subsegment.addError(error);
      throw error;
    } finally {
      subsegment.close();
    }
  });
}
```

### X-Ray Service Map
The X-Ray service map will visualize:
- Request flow between services
- Latency at each hop
- Error rates and fault patterns
- Throughput metrics

## Alerting and Notification Strategy

### CloudWatch Alarms

#### Critical Alarms
```json
{
  "AlarmName": "HighErrorRate-APIGateway",
  "AlarmDescription": "API Gateway error rate exceeds 5%",
  "MetricName": "HTTPCode_Target_5XX_Count",
  "Namespace": "AWS/ApplicationELB",
  "Statistic": "Sum",
  "Period": 300,
  "EvaluationPeriods": 2,
  "Threshold": 10,
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": [
    "arn:aws:sns:us-east-1:123456789012:CriticalAlerts"
  ]
}
```

#### Warning Alarms
```json
{
  "AlarmName": "HighCPUUtilization-UserService",
  "AlarmDescription": "User Service CPU utilization exceeds 75%",
  "MetricName": "CPUUtilization",
  "Namespace": "ECS/ContainerInsights",
  "Statistic": "Average",
  "Period": 300,
  "EvaluationPeriods": 3,
  "Threshold": 75,
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": [
    "arn:aws:sns:us-east-1:123456789012:WarningAlerts"
  ]
}
```

### Custom Metric Alarms
- **Order Processing Time**: Alert if > 5 seconds
- **Payment Failure Rate**: Alert if > 2%
- **Search Response Time**: Alert if > 2 seconds
- **Database Connection Pool**: Alert if > 90% utilization

### SNS Notification Topics
1. **CriticalAlerts**: Pages on-call team
2. **WarningAlerts**: Emails to team
3. **InfoAlerts**: Slack notifications
4. **BusinessMetrics**: Daily/weekly business reports

## Synthetic Monitoring

### CloudWatch Synthetics Canaries

#### API Health Check
```javascript
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const apiCanary = async function () {
    const URL = process.env.API_ENDPOINT || 'https://api.yourdomain.com/health';
    
    let response = await synthetics.getPage().goto(URL, {
        waitUntil: 'networkidle0',
        timeout: 30000
    });
    
    if (response.status() !== 200) {
        throw new Error(`Expected status code 200, but got ${response.status()}`);
    }
    
    // Validate response content
    const body = await response.text();
    const health = JSON.parse(body);
    
    if (health.status !== 'OK') {
        throw new Error(`Health check failed: ${body}`);
    }
    
    log.info('API health check passed');
};

exports.handler = async () => {
    return await synthetics.executeScript(apiCanary, {
        includeRequestHeaders: true,
        includeResponseHeaders: true,
        includeRequestBody: true,
        includeResponseBody: true
    });
};
```

#### User Journey Simulation
- **Login Flow**: Simulate user login and dashboard access
- **Product Search**: Execute sample searches and validate results
- **Checkout Process**: Simulate adding to cart and checkout
- **Admin Functions**: Test admin panel functionality

### Canary Schedules
- **Critical Paths**: Every 5 minutes
- **User Journeys**: Every 15 minutes
- **Business Metrics**: Hourly
- **Deep Checks**: Daily

## Performance Monitoring

### Frontend Performance
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Page Load Times**: Track across different pages
- **JavaScript Errors**: Capture and report client-side errors
- **Resource Loading**: Monitor asset loading performance

### Backend Performance
- **API Response Times**: Track 50th, 95th, 99th percentiles
- **Database Query Performance**: Slow query detection
- **Cache Hit Ratios**: Monitor caching effectiveness
- **External Service Calls**: Track third-party API performance

### Database Performance
- **Query Execution Plans**: Analyze slow queries
- **Index Usage**: Monitor index effectiveness
- **Connection Pooling**: Track connection usage
- **Replication Lag**: Monitor replica synchronization

## Business Metrics Monitoring

### Key Business Indicators
- **Conversion Rate**: Visitors to completed orders
- **Cart Abandonment Rate**: Carts not converted to orders
- **Average Order Value**: Track revenue trends
- **Customer Lifetime Value**: Long-term customer value
- **Inventory Turnover**: Product movement velocity

### Custom Dashboards

#### Operations Dashboard
- Service health status
- Error rates and trends
- Resource utilization
- Deployment frequency
- Mean time to recovery

#### Business Dashboard
- Revenue metrics
- User engagement
- Conversion funnel
- Customer satisfaction scores
- Marketing campaign effectiveness

## Incident Response

### Runbooks
- **Service Degradation**: Steps to diagnose and resolve
- **Database Issues**: Connection, performance, and corruption handling
- **Payment Failures**: Troubleshooting payment processing issues
- **Security Incidents**: Breach detection and response procedures

### Escalation Procedures
1. **Level 1**: Automated alerts to Slack/email
2. **Level 2**: Page on-call engineer after 15 minutes
3. **Level 3**: Page engineering manager after 1 hour
4. **Level 4**: Executive notification after 4 hours

### Post-Incident Process
- **Incident Report**: Root cause analysis and timeline
- **Action Items**: Fixes and preventive measures
- **Retrospective**: Team discussion and process improvements
- **Documentation Update**: Update runbooks and procedures

## Cost Management

### Monitoring Cost Optimization
- **Log Retention**: Balance retention with storage costs
- **Metric Sampling**: Sample high-volume metrics appropriately
- **Alarm Consolidation**: Combine similar alarms
- **Dashboard Optimization**: Remove unused dashboards

### Usage Monitoring
- **CloudWatch Usage**: Track metric and log volume
- **X-Ray Tracing**: Monitor trace volume and sampling
- **Synthetics**: Optimize canary frequency and scope
- **Third-Party Costs**: Monitor Datadog/New Relic usage

This monitoring and logging solution provides comprehensive observability for the B2B E-Commerce Platform, enabling proactive issue detection, rapid incident response, and data-driven optimization decisions.