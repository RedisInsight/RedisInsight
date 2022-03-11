#!/bin/bash

PLATFORM=${PLATFORM:-'linux'}
ELECTRON_VERSION=$(cat electron/version)
VERSION=${ELECTRON_VERSION:-'redisstack'}
ARCH=${ARCH:-'x64'}
FILENAME="RedisInsight-$PLATFORM.$VERSION.$ARCH.zip"

# reinstall backend prod dependencies only (optimise space)
rm -rf redisinsight/api/node_modules

npm_config_arch="$ARCH" \
npm_config_target_arch="$ARCH" \
npm_config_platform="$PLATFORM" \
npm_config_target_platform="$PLATFORM" \
npm_config_keytar_binary_host_mirror="$KEYTAR_MIRROR" \
npm_config_node_sqlite3_binary_host_mirror="$SQLITE_MIRROR" \
yarn --cwd ./redisinsight/api install --production

cp redisinsight/api/.yarnclean.prod redisinsight/api/.yarnclean
yarn --cwd ./redisinsight/api autoclean --force

rm -rf redisinsight/build.zip
cd redisinsight && zip -r build.zip \
api/node_modules \
api/dist \
ui/dist \
&& cd ..

mkdir -p release/redisstack
cp redisinsight/build.zip release/redisstack/"$FILENAME"
