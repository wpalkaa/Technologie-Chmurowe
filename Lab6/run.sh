#!/bin/bash

NETWORK=apps-net

docker stop frontend api-a api-b redis postgres
docker rm frontend api-a api-b redis postgres

docker network rm $NETWORK
docker network create $NETWORK

docker run -d \
    --name postgres \
    --network $NETWORK \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin \
    -e POSTGRES_DB=productsdb \
    -v pg-data:/var/lib/postgresql/data \
    postgres:15-alpine

docker run -d \
    --name redis \
    --network $NETWORK \
    --tmpfs /data \
    redis:7-alpine

sleep 3

docker run -d \
    --name api-a \
    --network $NETWORK \
    -e DB_HOST=postgres \
    -e DB_USER=admin \
    -e DB_PASSWORD=admin \
    -e DB_NAME=productsdb \
    -e REDIS_HOST=redis \
    -v "$(pwd)/backend:/app" \
    wojdeg13/chmury-backend:v4

docker run -d \
    --name api-b \
    --network $NETWORK \
    -e DB_HOST=postgres \
    -e DB_USER=admin \
    -e DB_PASSWORD=admin \
    -e DB_NAME=productsdb \
    -e REDIS_HOST=redis \
    -v "$(pwd)/backend:/app" \
    wojdeg13/chmury-backend:v4

sleep 3

docker run -d \
    --name frontend \
    --network $NETWORK \
    -p 80:80 \
    -v "$(pwd)/frontend/dist:/usr/share/nginx/html:ro" \
    wojdeg13/chmury-frontend:v4
