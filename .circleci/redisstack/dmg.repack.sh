#!/bin/bash

ARCH=${ARCH:-x64}
WORKING_DIRECTORY=$(pwd)
TAR_NAME="RedisInsight-preview-app-darwin.$ARCH.tar.gz"
APP_FOLDER_NAME="RedisInsight-preview.app"
TMP_FOLDER="/tmp/$APP_FOLDER_NAME"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

hdiutil attach "./release/RedisInsight-preview-mac-$ARCH.dmg"
cp -a /Volumes/RedisInsight-*/RedisInsight-preview.app "/tmp"
cd "/tmp" || exit 1
tar -czvf "$TAR_NAME" "$APP_FOLDER_NAME"
cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
hdiutil unmount /Volumes/RedisInsight-*/
