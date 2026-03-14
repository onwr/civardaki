#!/bin/bash
# scripts/backup-uploads.sh
# 
# A simple bash script to backup the Civardaki uploads directory.
# Intended to be run via cron on the VPS, e.g., daily at 3 AM:
# 0 3 * * * /path/to/civardaki-web/scripts/backup-uploads.sh >> /var/log/civardaki-backup.log 2>&1

# Configuration
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../public/uploads" && pwd)"
BACKUP_TARGET="/var/backups/civardaki/uploads" # Change this as needed
RETENTION_DAYS=7

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_TARGET}/uploads_backup_${TIMESTAMP}.tar.gz"

echo "[$(date)] Starting uploads backup..."

# Create target dir if it doesn't exist
mkdir -p "$BACKUP_TARGET"

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "ERROR: Source directory $SOURCE_DIR does not exist. Nothing to backup."
    exit 1
fi

# Create the tarball
echo "Compressing $SOURCE_DIR to $BACKUP_FILE ..."
tar -czf "$BACKUP_FILE" -C "$SOURCE_DIR" .

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
else
    echo "ERROR: Backup failed during compression."
    exit 1
fi

# Clean up old backups based on retention policy
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_TARGET" -name "uploads_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

if [ $? -eq 0 ]; then
    echo "Cleanup successful."
else
    echo "WARNING: Cleanup of old backups failed or no old backups found."
fi

echo "[$(date)] Backup process completed."
