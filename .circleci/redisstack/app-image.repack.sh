#!/bin/bash

ARCH=${ARCH:-x64}
WORKING_DIRECTORY=$(pwd)
SOURCE_APP="RedisInsight-preview-linux-$ARCH.AppImage"
TAR_NAME="RedisInsight-preview-app-linux.$ARCH.tar.gz"
TMP_FOLDER="/tmp/RedisInsight-app-$ARCH"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

cp "./release/$SOURCE_APP" "$TMP_FOLDER"
cd "$TMP_FOLDER" || exit 1

./"$SOURCE_APP" --appimage-extract
cd squashfs-root || exit 1

tar -czvf "$TAR_NAME" ./*
cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
