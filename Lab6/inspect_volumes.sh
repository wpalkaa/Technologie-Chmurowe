#!/bin/bash

VOLUMES=$(docker volume ls -q | grep -v -E "^[0-9a-fA-F]{64}$")

for vol in $VOLUMES; do
    echo "Znalezione wolumeny nazwane:"
    echo "  - ${vol}:"

    MOUNTPOINT=$(docker volume inspect $vol --format "{{.Mountpoint}}")

    SIZE=$(
        docker run --rm \
            -v $vol:/vol \
            alpine \
            sh -c "du -sh /vol 2>dev/null | cut -f 1"
    )

    CONTAINERS=$(docker ps -a --format "{{.Names}}" --filter volume="pg-data")

    if [ ${#CONTAINERS} -eq 0 ]; then 
        echo "    - Brak"
        continue
    fi

    for c in $CONTAINERS; do
        echo "    - ${c}"
    done
done