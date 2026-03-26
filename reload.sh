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

OLD_LOCK_SHA="$(sha1sum package-lock.json 2>/dev/null | awk '{print $1}' || true)"

echo "[reload] fetching latest..."
git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

NEW_LOCK_SHA="$(sha1sum package-lock.json 2>/dev/null | awk '{print $1}' || true)"
if [[ "$OLD_LOCK_SHA" != "$NEW_LOCK_SHA" ]]; then
  echo "[reload] dependencies changed. Running npm ci..."
  npm ci
else
  echo "[reload] dependencies unchanged. Skipping npm ci."
fi

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
for i in {1..15}; do
  if curl -fsS http://127.0.0.1:3000/health >/dev/null; then
    curl -fsS http://127.0.0.1:3000/health
    exit 0
  fi
  sleep 2
done

echo "[reload] health check failed after retries"
exit 1
