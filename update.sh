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
git fetch origin
git reset --hard origin/main

echo "📦 Install/update dependencies backend..."
cd "$BACKEND_DIR"
npm install --omit=dev

# Cek apakah .env ada
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "⚠️  File .env tidak ditemukan!"
    echo "   Buat file .env dari template: cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env"
    echo "   Lalu isi dengan nilai yang benar, kemudian jalankan update.sh lagi."
    exit 1
fi

echo "♻️  Restart backend dengan PM2..."
pm2 restart web-guru-backend

echo "🔄 Reload Nginx..."
nginx -t && systemctl reload nginx

echo "✅ Update selesai! Aplikasi sudah berjalan dengan kode terbaru."
pm2 status web-guru-backend
