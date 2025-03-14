#!/bin/bash
docker compose -p test-docker -f rte.docker-compose.yml -f local.web.docker-compose.yml down

rm -rf plugins remote report results rte test-data rihomedir

