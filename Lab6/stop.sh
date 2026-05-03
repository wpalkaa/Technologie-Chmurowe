#!/bin/bash

docker stop frontend api-a api-b redis postgres
docker rm frontend api-a api-b redis postgres

docker network rm app-net