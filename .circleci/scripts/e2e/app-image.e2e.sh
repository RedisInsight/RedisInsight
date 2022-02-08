yarn --cwd tests/e2e install

# mount app resources
./release/*.AppImage --appimage-mount >> apppath &

# run rte
TEST_BIG_DB_DUMP=$TEST_BIG_DB_DUMP \
docker-compose -f tests/e2e/rte.docker-compose.yml build
docker-compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d
./tests/e2e/wait-for-redis.sh localhost 8300 && \

# run tests
COMMON_URL=$(tail -n 1 apppath)/resources/app.asar/index.html \
ELECTRON_PATH=$(tail -n 1 apppath)/redisinsight \
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop:ci
