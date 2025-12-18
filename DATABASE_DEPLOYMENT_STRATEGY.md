# Database Deployment Strategy for AWS

This document outlines the database deployment strategy for the B2B E-Commerce Platform on AWS, focusing on MongoDB deployment options, backup strategies, and performance optimization.

## Database Architecture Overview

### Current Implementation
The platform currently uses MongoDB as its primary database with the following characteristics:
- Document-based storage
- Flexible schema design
- Horizontal scaling capabilities
- Rich query language

### AWS Deployment Options

#### Option 1: Amazon DocumentDB (Recommended for Production)
**Pros:**
- Fully managed MongoDB-compatible service
- Automatic backups and point-in-time recovery
- Built-in security and encryption
- High availability with multi-AZ deployment
- Automatic scaling of compute and storage

**Cons:**
- Higher cost compared to self-managed MongoDB
- Limited MongoDB API compatibility (some features not supported)
- Vendor lock-in

#### Option 2: Self-Managed MongoDB on EC2
**Pros:**
- Full control over MongoDB configuration
- Latest MongoDB features and versions
- Cost-effective for smaller deployments
- Flexibility in infrastructure choices

**Cons:**
- Manual setup and maintenance
- Responsibility for backups, monitoring, and security
- Requires database administration expertise

#### Option 3: MongoDB Atlas (Recommended for Rapid Prototyping)
**Pros:**
- Fully managed cloud database service
- Global clusters and multi-cloud support
- Automated scaling and backups
- Integrated security features

**Cons:**
- Dependent on external provider
- Potential data transfer costs
- Limited customization options

## Database Schema Design

### Collections Structure

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // Hashed
  firstName: String,
  lastName: String,
  role: String, // 'admin', 'customer', 'supplier'
  company: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

#### 2. Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  price: Number,
  originalPrice: Number,
  currency: String,
  images: [String], // Cloudinary URLs
  stock: Number,
  moq: Number, // Minimum Order Quantity
  unit: String,
  qualityGrade: String,
  certifications: [String],
  leadTime: Number, // in days
  postAs: String, // 'buyer' or 'seller'
  supplierId: ObjectId, // Reference to Users collection
  attributes: Object, // Flexible product attributes
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Orders Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId, // Reference to Users collection
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number,
    productName: String
  }],
  status: String, // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  totalAmount: Number,
  shippingAddress: Object,
  billingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  orderDate: Date,
  shippedDate: Date,
  deliveredDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  parentId: ObjectId, // For hierarchical categories
  image: String, // Cloudinary URL
  sortOrder: Number,
  isActive: Boolean,
  metaTitle: String,
  metaDescription: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Hero Slides Collection
```javascript
{
  _id: ObjectId,
  title: String,
  subtitle: String,
  imageUrl: String, // Cloudinary URL
  linkUrl: String,
  buttonText: String,
  isActive: Boolean,
  sortOrder: Number,
  backgroundColor: String,
  textColor: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexing Strategy

### Essential Indexes

#### Users Collection
```javascript
// Email index for login
db.users.createIndex({ "email": 1 }, { unique: true })

// Role-based queries
db.users.createIndex({ "role": 1 })

// Company search
db.users.createIndex({ "company": 1 })
```

#### Products Collection
```javascript
// Product search
db.products.createIndex({ "name": "text", "description": "text" })

// Category filtering
db.products.createIndex({ "category": 1 })

// Price sorting
db.products.createIndex({ "price": 1 })

// Supplier lookup
db.products.createIndex({ "supplierId": 1 })

// Active products
db.products.createIndex({ "isActive": 1 })

// PostAs filtering (buyer/seller)
db.products.createIndex({ "postAs": 1 })
```

#### Orders Collection
```javascript
// Customer orders
db.orders.createIndex({ "customerId": 1 })

// Order status
db.orders.createIndex({ "status": 1 })

// Order date for sorting
db.orders.createIndex({ "orderDate": -1 })

// Payment status
db.orders.createIndex({ "paymentStatus": 1 })
```

## Backup and Recovery Strategy

### Automated Backups
- **Frequency**: Daily snapshots at 2:00 AM UTC
- **Retention**: 30 days of daily backups
- **Long-term**: Monthly snapshots retained for 1 year
- **Storage**: Encrypted S3 buckets with versioning

### Point-in-Time Recovery
- **Capability**: Restore to any point within the last 35 days
- **Granularity**: 5-minute intervals
- **Process**: Automated restore procedures with validation

### Disaster Recovery
- **Multi-region**: Primary in us-east-1, DR in us-west-2
- **RTO**: Less than 4 hours
- **RPO**: Less than 1 hour
- **Testing**: Quarterly DR drills

### Export/Import Procedures
```bash
# Export database
mongodump --host <hostname> --port <port> --username <username> --password <password> --out /backup/mongodb

# Import database
mongorestore --host <hostname> --port <port> --username <username> --password <password> /backup/mongodb
```

## Performance Optimization

### Connection Pooling
- **Max Connections**: Configured based on service instance count
- **Timeout Settings**: 30-second connection timeouts
- **Idle Connection Handling**: Automatic cleanup after 10 minutes

### Query Optimization
- **Aggregation Pipelines**: Used for complex data transformations
- **Projection**: Only fetch required fields
- **Pagination**: Cursor-based pagination for large datasets

### Caching Strategy
- **Redis Layer**: For frequently accessed data
- **Cache Keys**: Composite keys with TTL
- **Invalidation**: Event-driven cache invalidation

### Read Scaling
- **Replica Sets**: 3-node replica sets for high availability
- **Read Preferences**: Secondary reads for reporting queries
- **Sharding**: Horizontal partitioning for large collections

## Security Implementation

### Authentication
- **Internal Access**: X.509 certificates for service-to-database communication
- **External Access**: SCRAM-SHA-256 authentication
- **Password Policy**: Enforced strong password requirements

### Authorization
- **Role-Based Access**: Database users with specific roles
- **Collection-Level Permissions**: Granular access control
- **Audit Logging**: Comprehensive access logging

### Encryption
- **At Rest**: AES-256 encryption for all data
- **In Transit**: TLS 1.3 for all connections
- **Key Management**: AWS KMS for encryption key management

## Monitoring and Maintenance

### Health Checks
- **Connectivity**: Regular connection tests
- **Performance**: Query response time monitoring
- **Resource Usage**: CPU, memory, and disk utilization

### Maintenance Windows
- **Primary Window**: Sunday 2:00 AM - 4:00 AM UTC
- **Activities**: Index rebuilds, statistics updates, log rotation
- **Notifications**: Automated alerts for maintenance completion

### Performance Tuning
- **Query Analysis**: Regular slow query log analysis
- **Index Optimization**: Periodic index review and cleanup
- **Storage Optimization**: Compaction and defragmentation

## Migration Strategy

### Initial Migration
1. **Schema Validation**: Ensure compatibility with target MongoDB version
2. **Data Export**: Export from current database
3. **Transformation**: Apply any necessary data transformations
4. **Import**: Import into AWS database
5. **Validation**: Verify data integrity and completeness

### Ongoing Sync
- **Change Data Capture**: Monitor for ongoing changes during migration
- **Delta Sync**: Incremental updates during cutover period
- **Cutover Plan**: Coordinated switchover with minimal downtime

## Cost Management

### Storage Optimization
- **Compression**: WiredTiger compression for storage efficiency
- **Archiving**: Move old data to cheaper storage tiers
- **Cleanup**: Regular removal of obsolete data

### Compute Optimization
- **Auto-scaling**: Dynamic adjustment of compute resources
- **Rightsizing**: Regular review of instance types
- **Reserved Instances**: Commit to reserved capacity for predictable workloads

This database deployment strategy ensures a robust, scalable, and secure foundation for the B2B E-Commerce Platform on AWS.