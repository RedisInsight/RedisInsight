#!/bin/bash
set -e

yarn --cwd tests/e2e install

# Create the ri-test directory if it doesn't exist
mkdir -p ri-test

# Extract the AppImage
chmod +x ./release/*.AppImage
./release/*.AppImage --appimage-extract

# Move contents of squashfs-root to ri-test and remove squashfs-root folder
mv squashfs-root/* ri-test/
rm -rf squashfs-root

# Export custom XDG_DATA_DIRS with ri-test
export XDG_DATA_DIRS="$(pwd)/ri-test:$XDG_DATA_DIRS"

# create folder before tests run to prevent permissions issue
mkdir -p tests/e2e/remote
mkdir -p tests/e2e/rdi

# Create a custom .desktop file for RedisInsight
cat > ri-test/redisinsight.desktop <<EOL
[Desktop Entry]
Version=1.0
Name=RedisInsight
Exec=$(pwd)/ri-test/redisinsight %u
Icon=$(pwd)/ri-test/resources/app.asar/img/icon.png
Type=Application
Terminal=false
MimeType=x-scheme-handler/redisinsight;
EOL

# Copy the .desktop file to the local applications directory
cp ri-test/redisinsight.desktop "$HOME/.local/share/applications"

# Update the desktop database with custom directory
update-desktop-database "$(pwd)/ri-test/"

# Register the RedisInsight deeplink protocol
xdg-mime default redisinsight.desktop x-scheme-handler/redisinsight

# Run rte
docker compose -f tests/e2e/rte.docker-compose.yml build
docker compose -f tests/e2e/rte.docker-compose.yml up --force-recreate -d -V
./tests/e2e/wait-for-redis.sh localhost 12000 && \

# Run tests
COMMON_URL=$(pwd)/ri-test/resources/app.asar/dist/renderer/index.html \
ELECTRON_PATH=$(pwd)/ri-test/redisinsight \
RI_SOCKETS_CORS=true \
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop:ci
