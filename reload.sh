#!/usr/bin/env bash
set -euo pipefail

# One-command update for EC2 deployment.
# - Pull latest code from current branch (or passed branch)
# - Install deps only when lockfile changed
# - Rebuild frontend/services
# - Restart PM2 processes with updated env

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD)}"

echo "[reload] repo: $REPO_DIR"
echo "[reload] branch: $BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[reload] warning: local changes detected. Continuing without auto-stash."
  echo "[reload] warning: if git pull fails, commit/stash changes manually and rerun."
fi

echo "[reload] fetching latest..."
git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [[ ! -f ".env" ]]; then
  echo "[reload] missing root .env file"
  echo "[reload] create it from one of these templates, then rerun:"
  echo "[reload]   cp .env.aws.template .env"
  echo "[reload]   nano .env"
  exit 1
fi

echo "[reload] installing dependencies..."
npm ci

echo "[reload] syncing env files from root .env..."
npm run env:sync

echo "[reload] building services/frontend..."
npm run build:services
npm run build:frontend

echo "[reload] restarting PM2 processes..."
if pm2 describe services >/dev/null 2>&1; then
  pm2 restart services --update-env
else
  pm2 start npm --name services -- run start:services
fi

if pm2 describe frontend >/dev/null 2>&1; then
  pm2 restart frontend --update-env
else
  pm2 start npm --name frontend -- run start:frontend
fi

pm2 save

echo "[reload] done."
echo "[reload] health check:"
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:3000/health >/dev/null; then
    curl -fsS http://127.0.0.1:3000/health
    exit 0
  fi
  echo "[reload] waiting for API Gateway... attempt $i/30"
  sleep 2
done

echo "[reload] health check failed after retries"
exit 1
