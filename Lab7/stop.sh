#!/bin/bash

docker stop frontend api-a api-b redis postgres worker
docker rm frontend api-a api-b redis postgres worker

docker network rm app-net db-net proxy-net