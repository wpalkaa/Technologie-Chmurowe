#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Nie podawno ścieżki do backupa"
    exit 1
fi

BACKUP=$1
VOLUME="pg-data"

if [ ! -f "backup/$BACKUP" ]; then 
    echo "Nieznaleziono takiego backupa."
    exit 1
fi

echo "[1/4] Zatrzymywanie bazy danych"
docker stop postgres


echo "[2/4] Usuwanie danych i przywracanie ${BACKUP}"
docker run --rm \
    -v $VOLUME:/vol \
    -v "$(pwd)/backup:/backup" \
    alpine \
    sh -c "rm -rf /vol/* && tar xzf /backup/${BACKUP} -C /vol"

echo "[3/4] Uruchomienie bazy danych"
docker start postgres

echo "[4/4] Healthcheck..."
sleep 3

if docker exec postgres pg_isready -U admin 1> /dev/null; then
    echo "Sukces"
    exit 0
else
    echo "Błąd"
    exit 1
fi

