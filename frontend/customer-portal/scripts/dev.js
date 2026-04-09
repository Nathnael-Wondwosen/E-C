const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function normalizeWindowsPath(filePath) {
  if (process.platform !== 'win32') return filePath;
  return filePath.replace(/^[a-z]:/, (drive) => drive.toUpperCase());
}

const scriptDir = __dirname;
const workspaceRoot = normalizeWindowsPath(fs.realpathSync.native(path.resolve(scriptDir, '..')));
const nextCacheDir = path.join(workspaceRoot, '.next');
const invocationCwd = normalizeWindowsPath(fs.realpathSync.native(process.cwd()));
const invocationNextCacheDir = path.join(invocationCwd, '.next');
const port = process.env.PORT || '3005';
const baseUrl = process.env.NEXT_PUBLIC_DEV_BASE_URL || `http://127.0.0.1:${port}`;
const clearCacheSetting = process.env.CLEAR_NEXT_CACHE;
const shouldClearNextCache =
  clearCacheSetting == null
    ? false
    : ['1', 'true', 'yes', 'on'].includes(String(clearCacheSetting).toLowerCase());
const nodeMajor = Number(process.versions.node.split('.')[0] || 0);
const allowUnsupportedNode =
  ['1', 'true', 'yes', 'on'].includes(String(process.env.ALLOW_UNSUPPORTED_NODE || '').toLowerCase());

process.chdir(workspaceRoot);
if (shouldClearNextCache) {
  console.log('[customer-portal] clearing .next cache before dev startup');
  try {
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
    // If npm invoked this script from monorepo root, clear that stale cache too.
    if (invocationNextCacheDir !== nextCacheDir) {
      fs.rmSync(invocationNextCacheDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(
      `[customer-portal] unable to clear .next cache (${error?.code || 'unknown'}). Continuing without cache clear.`
    );
  }
}
if (nodeMajor !== 20) {
  const message = `[customer-portal] Node ${process.versions.node} detected. This app requires Node 20.x for stable Next.js dev behavior.`;
  if (!allowUnsupportedNode) {
    console.error(message);
    console.error('[customer-portal] Switch to Node 20 (nvm use 20) and restart dev. Set ALLOW_UNSUPPORTED_NODE=1 only if you intentionally want to bypass this check.');
    process.exit(1);
  }
  console.warn(`${message} Continuing because ALLOW_UNSUPPORTED_NODE=1 is set.`);
}

const nextBin = normalizeWindowsPath(require.resolve('next/dist/bin/next'));
const childEnv = {
  ...process.env,
};
if (process.platform === 'win32' && !childEnv.NEXT_DISABLE_WEBPACK_CACHE) {
  childEnv.NEXT_DISABLE_WEBPACK_CACHE = '1';
}

const child = spawn(process.execPath, [nextBin, 'dev', '-p', port], {
  cwd: workspaceRoot,
  stdio: 'inherit',
  env: childEnv,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function warmAuthRoutes() {
  const warmPaths = ['/', '/login', '/signup'];

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        await Promise.all(
          warmPaths.map((route) => fetch(`${baseUrl}${route}`).catch(() => null))
        );
        return;
      }
    } catch (_error) {
      // Next dev server may not be ready yet.
    }

    await sleep(1000);
  }
}

warmAuthRoutes().catch(() => null);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
