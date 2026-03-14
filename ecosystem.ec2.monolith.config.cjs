module.exports = {
  apps: [
    {
      name: 'api-gateway',
      cwd: '/home/ubuntu/E-C',
      script: 'npm',
      args: 'run start --workspace=services/api-gateway',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        MONGODB_URI: 'REPLACE_WITH_MONGODB_URI',
        MONGODB_DB_NAME: 'ecommerce_platform',
        JWT_SECRET: 'REPLACE_WITH_STRONG_SECRET',
        JWT_EXPIRES_IN: '7d',
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'REPLACE_WITH_STRONG_PASSWORD',
        CORS_ORIGIN: 'http://REPLACE_WITH_EC2_PUBLIC_IP_OR_DOMAIN',
        ENFORCE_IDENTITY_BOUNDARY: 'false'
      }
    },
    {
      name: 'customer-portal',
      cwd: '/home/ubuntu/E-C',
      script: 'npm',
      args: 'run start --workspace=frontend/customer-portal',
      env: {
        NODE_ENV: 'production',
        PORT: '3005',
        NEXT_PUBLIC_API_BASE_URL: 'http://REPLACE_WITH_EC2_PUBLIC_IP_OR_DOMAIN'
      }
    },
    {
      name: 'admin-dashboard',
      cwd: '/home/ubuntu/E-C',
      script: 'npm',
      args: 'run start --workspace=frontend/admin-dashboard',
      env: {
        NODE_ENV: 'production',
        PORT: '3006',
        NEXT_PUBLIC_API_BASE_URL: 'http://REPLACE_WITH_EC2_PUBLIC_IP_OR_DOMAIN'
      }
    }
  ]
};
