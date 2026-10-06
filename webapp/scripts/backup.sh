#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Tulie Mentoring — Database Backup Script
# Tải bản sao lưu Database về máy cục bộ (local)
# ═══════════════════════════════════════════════════════════════

set -e

# Add libpq (Homebrew keg-only) to PATH
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

# Load .env file from webapp directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBAPP_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$WEBAPP_DIR/.env" ]; then
    export $(grep -v '^#' "$WEBAPP_DIR/.env" | grep DIRECT_URL | xargs)
fi

if [ -z "$DIRECT_URL" ]; then
    echo "❌ Không tìm thấy DIRECT_URL trong .env"
    echo "   Hãy đảm bảo file .env có dòng: DIRECT_URL=\"postgresql://...\""
    exit 1
fi

# Create backups directory
BACKUP_DIR="$WEBAPP_DIR/backups"
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/tulie_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo "═══════════════════════════════════════════════════"
echo "  🗄️  Tulie Mentoring — Database Backup"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📅 Thời gian: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📁 File backup: $BACKUP_FILE_GZ"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump chưa được cài đặt."
    echo "   Cài đặt: brew install postgresql"
    exit 1
fi

echo "⏳ Đang sao lưu database..."
echo ""

# Run pg_dump
pg_dump "$DIRECT_URL" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --format=plain \
    --encoding=UTF8 \
    > "$BACKUP_FILE" 2>&1

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    # Compress
    gzip "$BACKUP_FILE"
    
    FILE_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    
    echo "✅ Sao lưu thành công!"
    echo ""
    echo "📦 File: $BACKUP_FILE_GZ"
    echo "📏 Kích thước: $FILE_SIZE"
    echo ""
    
    # Cleanup old backups (keep last 10)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/tulie_backup_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BACKUP_COUNT" -gt 10 ]; then
        echo "🧹 Dọn dẹp bản backup cũ (giữ lại 10 bản gần nhất)..."
        ls -1t "$BACKUP_DIR"/tulie_backup_*.sql.gz | tail -n +11 | xargs rm -f
        echo "   Đã xóa $(($BACKUP_COUNT - 10)) bản backup cũ."
    fi
    
    echo "═══════════════════════════════════════════════════"
    echo "  ✨ Hoàn tất! Dữ liệu đã được sao lưu an toàn."
    echo "═══════════════════════════════════════════════════"
else
    echo "❌ Sao lưu thất bại!"
    rm -f "$BACKUP_FILE"
    exit 1
fi
