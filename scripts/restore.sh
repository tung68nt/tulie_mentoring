#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Tulie Mentoring — Database Restore Script
# Khôi phục Database từ file backup
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
    exit 1
fi

BACKUP_DIR="$WEBAPP_DIR/backups"

echo "═══════════════════════════════════════════════════"
echo "  🔄 Tulie Mentoring — Database Restore"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql chưa được cài đặt."
    echo "   Cài đặt: brew install postgresql"
    exit 1
fi

# If a file argument is provided, use it
BACKUP_FILE="$1"

# If no argument, show available backups
if [ -z "$BACKUP_FILE" ]; then
    echo "📂 Các bản backup có sẵn:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR"/tulie_backup_*.sql.gz 2>/dev/null)" ]; then
        echo "   ❌ Không tìm thấy bản backup nào trong $BACKUP_DIR"
        echo ""
        echo "   Cách dùng: ./scripts/restore.sh [đường dẫn file backup]"
        echo "   Ví dụ:    ./scripts/restore.sh backups/tulie_backup_20260320_223000.sql.gz"
        exit 1
    fi
    
    # List backups with numbering
    i=1
    declare -a BACKUPS
    for f in $(ls -1t "$BACKUP_DIR"/tulie_backup_*.sql.gz 2>/dev/null); do
        FILE_SIZE=$(du -h "$f" | cut -f1)
        FILE_DATE=$(echo "$f" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
        echo "   [$i] $FILE_DATE  ($FILE_SIZE)  $(basename "$f")"
        BACKUPS[$i]="$f"
        i=$((i+1))
    done
    
    echo ""
    read -p "👉 Chọn số thứ tự bản backup (hoặc nhấn Enter để hủy): " CHOICE
    
    if [ -z "$CHOICE" ]; then
        echo "   ❌ Đã hủy."
        exit 0
    fi
    
    BACKUP_FILE="${BACKUPS[$CHOICE]}"
    
    if [ -z "$BACKUP_FILE" ]; then
        echo "   ❌ Lựa chọn không hợp lệ."
        exit 1
    fi
fi

# Validate file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File không tồn tại: $BACKUP_FILE"
    exit 1
fi

echo ""
echo "⚠️  CẢNH BÁO: Thao tác này sẽ GHI ĐÈ TOÀN BỘ dữ liệu hiện tại!"
echo "   File backup: $(basename "$BACKUP_FILE")"
echo ""
read -p "🔴 Bạn có chắc chắn muốn khôi phục? (gõ 'YES' để xác nhận): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "   ❌ Đã hủy khôi phục."
    exit 0
fi

echo ""
echo "⏳ Đang khôi phục database..."

# Decompress and restore
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql "$DIRECT_URL" --single-transaction -q 2>&1
else
    psql "$DIRECT_URL" --single-transaction -q < "$BACKUP_FILE" 2>&1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Khôi phục thành công!"
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "  ✨ Database đã được khôi phục về trạng thái cũ."
    echo "  🔄 Hãy reload lại ứng dụng web để thấy dữ liệu."
    echo "═══════════════════════════════════════════════════"
else
    echo ""
    echo "❌ Khôi phục thất bại! Kiểm tra lại file backup."
    exit 1
fi
