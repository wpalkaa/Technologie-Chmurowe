#!/bin/bash

NETWORK=apps-net

docker stop api-dev redis postgres 
docker rm api-dev redis postgres

docker network rm $NETWORK
docker network create $NETWORK


docker run -d \
    --name postgres \
    --network $NETWORK \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin \
    -e POSTGRES_DB=productsdb \
    postgres:15-alpine

docker run -d \
    --name redis \
    --network $NETWORK \
    --tmpfs /data \
    redis:7-alpine

sleep 3

docker run -d \
    --name api-dev \
    --network $NETWORK \
    -p 3000:3000 \
    -e DB_HOST=postgres \
    -e DB_USER=admin \
    -e DB_PASSWORD=admin \
    -e DB_NAME=productsdb \
    -e REDIS_HOST=redis \
    -v "$(pwd)/backend:/app" \
    -w /app \
    node:20-alpine sh -c "npm i -g nodemon && nodemon --legacy-watch server.js"


