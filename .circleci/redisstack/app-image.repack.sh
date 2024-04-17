#!/bin/bash
set -e

ARCH=${ARCH:-x86_64}
WORKING_DIRECTORY=$(pwd)
SOURCE_APP=${SOURCE_APP:-"Redis-Insight-linux-$ARCH.AppImage"}
RI_APP_FOLDER_NAME="Redis-Insight-linux"
TAR_NAME="Redis-Insight-app-linux.$ARCH.tar.gz"
TMP_FOLDER="/tmp/Redis-Insight-app-$ARCH"

rm -rf "$TMP_FOLDER"

mkdir -p "$WORKING_DIRECTORY/release/redisstack"
mkdir -p "$TMP_FOLDER"

cp "./release/$SOURCE_APP" "$TMP_FOLDER"
cd "$TMP_FOLDER" || exit 1

./"$SOURCE_APP" --appimage-extract
mv squashfs-root "$RI_APP_FOLDER_NAME"

tar -czvf "$TAR_NAME" "$RI_APP_FOLDER_NAME"

cp "$TAR_NAME" "$WORKING_DIRECTORY/release/redisstack/"
cd "$WORKING_DIRECTORY" || exit 1
