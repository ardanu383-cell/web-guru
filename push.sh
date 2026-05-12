#!/bin/bash

# ─────────────────────────────────────────
#  push.sh — Jalankan di lokal
#  Usage: bash push.sh "pesan commit"
# ─────────────────────────────────────────

set -e

COMMIT_MSG=${1:-"update $(date '+%Y-%m-%d %H:%M')"}

echo "📦 Menambahkan semua perubahan..."
git add .

echo "✏️  Commit: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "🚀 Push ke GitHub..."
git push

echo "✅ Selesai! Kode berhasil di-push ke GitHub."
