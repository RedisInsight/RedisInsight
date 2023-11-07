#!/bin/bash
set -e

ARCH=${ARCH:-x64}
WORKING_DIRECTORY=$(pwd)
TAR_NAME="RedisInsight-app-darwin.$ARCH.tar.gz"
APP_FOLDER_NAME="RedisInsight.app"
TMP_FOLDER="/tmp/$APP_FOLDER_NAME"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

hdiutil attach "./release/RedisInsight-mac-$ARCH.dmg"
cp -a /Volumes/RedisInsight*/RedisInsight.app "/tmp"
cd "/tmp" || exit 1
tar -czvf "$TAR_NAME" "$APP_FOLDER_NAME"
cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
hdiutil unmount /Volumes/RedisInsight*/
