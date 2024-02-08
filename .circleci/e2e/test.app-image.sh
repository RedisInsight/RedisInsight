#!/bin/bash
set -e

yarn --cwd tests/e2e install

# mount app resources
./release/*.AppImage --appimage-mount >> apppath &

# create folder before tests run to prevent permissions issue
mkdir -p tests/e2e/remote
mkdir -p tests/e2e/rdi

# run rte
docker-compose -f tests/e2e/rte.docker-compose.yml build
docker-compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
./tests/e2e/wait-for-redis.sh localhost 12000 && \

# run tests
COMMON_URL=$(tail -n 1 apppath)/resources/app.asar/dist/renderer/index.html \
ELECTRON_PATH=$(tail -n 1 apppath)/redisinsight \
RI_SOCKETS_CORS=true \
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop:ci
