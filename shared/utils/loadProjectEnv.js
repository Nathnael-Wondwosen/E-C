const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadIfExists(envPath, override = false) {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  dotenv.config({ path: envPath, override });
  return true;
}

function loadProjectEnv(serviceDir) {
  const projectRoot = path.resolve(serviceDir, '../..');
  const rootEnvPath = path.join(projectRoot, '.env');
  const localEnvPath = path.join(serviceDir, '.env');

  // Load service-local env first for compatibility, then force the root .env
  // to win so the project has one canonical source of truth.
  loadIfExists(localEnvPath);
  loadIfExists(rootEnvPath, true);

  return { projectRoot, rootEnvPath, localEnvPath };
}

module.exports = { loadProjectEnv };
