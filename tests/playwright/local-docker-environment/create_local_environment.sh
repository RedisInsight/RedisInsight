#!/bin/bash

mkdir -p "rihomedir"
chmod +w rihomedir/

docker compose -p test-docker -f rte.docker-compose.yml -f local.web.docker-compose.yml up -d

