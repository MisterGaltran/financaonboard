#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/mnt/projects/financaonboard"
SERVICE_NAME="financaonboard-api.service"

cd "$PROJECT_DIR"

echo "==> git pull"
git pull --ff-only

echo "==> npm ci (backend)"
cd "$PROJECT_DIR/backend"
npm ci --omit=dev

echo "==> systemctl restart $SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

echo "==> aguardando 3s e checando status"
sleep 3
systemctl is-active "$SERVICE_NAME"
journalctl -u "$SERVICE_NAME" -n 20 --no-pager
