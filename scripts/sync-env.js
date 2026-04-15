const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rootEnvPath = path.join(projectRoot, '.env');
const rootExamplePath = path.join(projectRoot, '.env.example');

const SHARED_KEYS = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'MONGODB_DNS_SERVERS',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'EXPOSE_PASSWORD_RESET_TOKEN',
  'CORS_ORIGIN',
  'IDENTITY_SERVICE_URL',
  'ENFORCE_IDENTITY_BOUNDARY',
  'IDENTITY_SERVICE_PORT',
  'PORT',
  'USER_SERVICE_PORT',
  'RATE_LIMIT_PER_MINUTE',
  'REDIS_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_URL',
  'ALGOLIA_APP_ID',
  'ALGOLIA_SEARCH_KEY',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS',
  'NEXT_PUBLIC_HTTP_TIMEOUT_MS',
  'NEXT_PUBLIC_HTTP_RETRIES'
];

const TARGETS = [
  {
    path: path.join(projectRoot, 'frontend', 'customer-portal', '.env.local'),
    title: 'Customer Portal environment',
    keys: [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
      'NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS',
      'NEXT_PUBLIC_HTTP_TIMEOUT_MS',
      'NEXT_PUBLIC_HTTP_RETRIES',
      'CLOUDINARY_URL',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'ALGOLIA_APP_ID',
      'ALGOLIA_SEARCH_KEY'
    ]
  },
  {
    path: path.join(projectRoot, 'frontend', 'admin-dashboard', '.env.local'),
    title: 'Admin Dashboard environment',
    keys: [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS',
      'NEXT_PUBLIC_HTTP_TIMEOUT_MS',
      'NEXT_PUBLIC_HTTP_RETRIES',
      'CLOUDINARY_URL',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'ALGOLIA_APP_ID',
      'ALGOLIA_SEARCH_KEY'
    ]
  }
];

function ensureRootEnv() {
  if (fs.existsSync(rootEnvPath)) {
    return false;
  }

  if (!fs.existsSync(rootExamplePath)) {
    throw new Error('Cannot create .env because .env.example is missing.');
  }

  fs.copyFileSync(rootExamplePath, rootEnvPath);
  return true;
}

function parseEnvFile(content) {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    env[key] = value;
  }

  return env;
}

function serializeEnv(title, sourceEnv, keys) {
  const lines = [
    `# ${title}`,
    '# Generated from the project root .env by scripts/sync-env.js',
    '# Edit the root .env, then run: npm run env:sync',
    ''
  ];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(sourceEnv, key)) {
      lines.push(`${key}=${sourceEnv[key]}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function writeTarget(target, sourceEnv) {
  const content = serializeEnv(target.title, sourceEnv, target.keys);
  fs.writeFileSync(target.path, content, 'utf8');
}

function main() {
  const createdRootEnv = ensureRootEnv();
  const sourceEnv = parseEnvFile(fs.readFileSync(rootEnvPath, 'utf8'));

  for (const target of TARGETS) {
    writeTarget(target, sourceEnv);
  }

  const requiredKeys = ['MONGODB_URI', 'JWT_SECRET', 'NEXT_PUBLIC_API_BASE_URL'];
  const missingKeys = requiredKeys.filter((key) => !sourceEnv[key]);

  if (createdRootEnv) {
    console.log('Created .env from .env.example.');
  }

  console.log('Synced frontend environment files from the root .env.');

  if (missingKeys.length) {
    console.log(`Still missing required values in .env: ${missingKeys.join(', ')}`);
  } else {
    console.log('Core variables look present: MONGODB_URI, JWT_SECRET, NEXT_PUBLIC_API_BASE_URL');
  }
}

main();
