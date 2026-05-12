#!/bin/bash

# ─────────────────────────────────────────
#  update.sh — Jalankan di VPS
#  Usage: bash update.sh
# ─────────────────────────────────────────

set -e

APP_DIR="/var/www/web-guru"
BACKEND_DIR="$APP_DIR/backend"

echo "📥 Pull kode terbaru dari GitHub..."
cd "$APP_DIR"
git pull

echo "📦 Install/update dependencies backend..."
cd "$BACKEND_DIR"
npm install --omit=dev

echo "♻️  Restart backend dengan PM2..."
pm2 restart web-guru-backend

echo "🔄 Reload Nginx..."
nginx -t && systemctl reload nginx

echo "✅ Update selesai! Aplikasi sudah berjalan dengan kode terbaru."
pm2 status web-guru-backend
