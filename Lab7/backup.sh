#!/bin/bash

echo "Tworzenie backupa..."

VOLUME="pg-data"
TIME=$(date +"%Y-%m-%d_%H-%M")
BACKUP_NAME="backup_${VOLUME}_${TIME}.tar.gz"

BACKUP_PATH="backup/${BACKUP_NAME}"

mkdir -p backup

docker run --rm \
    --name $VOLUME-backup \
    -v $VOLUME:/vol \
    -v "$(pwd)/backup:/backup" \
    alpine \
    sh -c "tar -czf /$BACKUP_PATH -C /vol ."

echo "Backup zapisany: ${BACKUP_PATH}" 