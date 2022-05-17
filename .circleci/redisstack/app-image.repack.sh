#!/bin/bash
set -euxo pipefail

ARCH=${ARCH:-x86_64}
WORKING_DIRECTORY=$(pwd)
SOURCE_APP=${SOURCE_APP:-"RedisInsight-v2-linux-$ARCH.AppImage"}
APP_FOLDER_NAME="RedisInsight-v2-linux"
TAR_NAME="RedisInsight-v2-app-linux.$ARCH.tar.gz"
TMP_FOLDER="/tmp/RedisInsight-app-$ARCH"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

cp "./release/$SOURCE_APP" "$TMP_FOLDER"
cd "$TMP_FOLDER" || exit 1

./"$SOURCE_APP" --appimage-extract
mv squashfs-root "$APP_FOLDER_NAME"

tar -czvf "$TAR_NAME" "$APP_FOLDER_NAME"

cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
