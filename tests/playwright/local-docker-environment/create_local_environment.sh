#!/bin/bash

mkdir "rihomedir"
sudo chmod -R 777 rihomedir/

docker compose -p test-docker -f rte.docker-compose.yml -f local.web.docker-compose.yml up -d

