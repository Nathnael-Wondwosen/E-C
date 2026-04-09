const path = require('path');
const { spawnSync } = require('child_process');

const workspace = process.argv[2];

if (!workspace) {
  console.error('Usage: node scripts/run-smoke-check.js <workspace>');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runNodeCheck = (relativePath) => {
  const target = path.join(root, relativePath);
  const result = spawnSync(process.execPath, ['--check', target], {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Syntax check failed for ${relativePath}`);
  }
};

try {
  switch (workspace) {
    case 'api-gateway': {
      runNodeCheck('services/api-gateway/server.js');
      const gateway = require(path.join(root, 'services/api-gateway/app'));
      assert(typeof gateway.createApp === 'function', 'api-gateway createApp export is missing');
      assert(typeof gateway.startServer === 'function', 'api-gateway startServer export is missing');
      break;
    }
    case 'identity-service': {
      runNodeCheck('services/identity-service/server.js');
      const identity = require(path.join(root, 'services/identity-service/app'));
      assert(typeof identity.createApp === 'function', 'identity-service createApp export is missing');
      assert(typeof identity.startServer === 'function', 'identity-service startServer export is missing');
      break;
    }
    case 'user-service': {
      runNodeCheck('services/user-service/server.js');
      break;
    }
    case 'shared': {
      const shared = require(path.join(root, 'shared'));
      assert(shared && typeof shared === 'object', 'shared package did not export an object');
      assert(shared.schemas && shared.schemas.user, 'shared user schema export is missing');
      assert(shared.schemas && shared.schemas.product, 'shared product schema export is missing');
      assert(shared.schemas && shared.schemas.order, 'shared order schema export is missing');
      assert(shared.utils && typeof shared.utils.formatDate === 'function', 'shared formatDate export is missing');
      assert(shared.utils && typeof shared.utils.calculateTotal === 'function', 'shared calculateTotal export is missing');
      break;
    }
    default:
      throw new Error(`Unknown workspace "${workspace}"`);
  }

  console.log(`Smoke checks passed for ${workspace}`);
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
