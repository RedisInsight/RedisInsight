#!/bin/bash

ARCH=${ARCH:-x64}
WORKING_DIRECTORY=$(pwd)
TAR_NAME="RedisInsight-preview-app-darwin.$ARCH.tar.gz"
TMP_FOLDER="/tmp/RedisInsight-app-$ARCH"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

hdiutil attach "./release/RedisInsight-preview-mac-$ARCH.dmg"
cp -r /Volumes/RedisInsight-*/RedisInsight-preview.app/* "$TMP_FOLDER"
cd "$TMP_FOLDER" || exit 1
tar -czvf "$TAR_NAME" ./*
cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
hdiutil unmount /Volumes/RedisInsight-*/
