#!/bin/bash
set -e

# Create folder before tests run to prevent permissions issues
mkdir -p tests/e2e/remote

# Run RTE (Redis Test Environment)
docker-compose -f tests/e2e/rte.docker-compose.yml build
docker-compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
./tests/e2e/wait-for-redis.sh localhost 12000

# Run tests
RI_SOCKETS_CORS=true \
yarn --cwd tests/e2e dotenv -e .ci.env yarn --cwd tests/e2e test:ci
