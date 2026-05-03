#!/bin/bash


docker stop frontend api-a api-b redis postgres worker
docker rm frontend api-a api-b redis postgres worker

docker network rm proxy-net app-net db-net

docker network create \
    --driver bridge \
    --subnet 172.16.1.0/24 \
    --gateway 172.16.1.1 \
    proxy-net
docker network create \
    --driver bridge \
    --subnet 172.16.2.0/24 \
    --gateway 172.16.2.1 \
    app-net
docker network create \
    --driver bridge \
    --subnet 172.16.3.0/24 \
    --gateway 172.16.3.1 \
    db-net

docker run -d \
    --name postgres \
    --network db-net \
    --ip 172.16.3.2 \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin \
    -e POSTGRES_DB=productsdb \
    -v pg-data:/var/lib/postgresql/data \
    postgres:15-alpine

docker run -d \
    --name redis \
    --network app-net \
    --ip 172.16.2.2 \
    --tmpfs /data \
    redis:7-alpine

sleep 3

docker run -d \
    --name api-a \
    --network proxy-net \
    -e DB_HOST=postgres \
    -e DB_USER=admin \
    -e DB_PASSWORD=admin \
    -e DB_NAME=productsdb \
    -e REDIS_HOST=redis \
    -v "$(pwd)/backend:/app" \
    wojdeg13/chmury-backend:v4

docker network connect db-net api-a
docker network connect app-net api-a

docker run -d \
    --name api-b \
    --network proxy-net \
    -e DB_HOST=postgres \
    -e DB_USER=admin \
    -e DB_PASSWORD=admin \
    -e DB_NAME=productsdb \
    -e REDIS_HOST=redis \
    -v "$(pwd)/backend:/app" \
    wojdeg13/chmury-backend:v4

docker network connect db-net api-b
docker network connect app-net api-b

docker run -d \
    --name worker \
    --network app-net \
    -e DB_HOST=postgres \
    -e DB_USER=admin \
    -e DB_PASSWORD=admin \
    -e DB_NAME=productsdb \
    -e REDIS_HOST=redis \
    wojdeg13/chmury-backend:v4

docker connect db-net worker

sleep 3

docker run -d \
    --name frontend \
    --network proxy-net \
    --mac-address "02:42:ac:15:00:20" \
    -p 80:80 \
    -v "$(pwd)/frontend/dist:/usr/share/nginx/html:ro" \
    wojdeg13/chmury-frontend:v4
