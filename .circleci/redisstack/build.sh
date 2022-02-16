#!/bin/bash

PLATFORM=${PLATFORM:-'Linux'}
ELECTRON_VERSION=$(cat electron/version)
VERSION=${ELECTRON_VERSION:-'redisstack'}
ARCH=${ARCH:-'x86_64'}
FILENAME="RedisInsight-${PLATFORM}.$VERSION.${ARCH}.zip"

# reinstall backend prod dependencies only (optimise space)
rm -rf redisinsight/api/node_modules
yarn --cwd ./redisinsight/api install --production
cp redisinsight/api/.yarnclean.prod ./redisinsight/api/.yarnclean
yarn --cwd ./redisinsight/api autoclean --force

cd redisinsight && zip -r build.zip \
api/node_modules \
api/dist \
ui/dist \
&& cd ..

mkdir -p release/redisstack
cp redisinsight/build.zip release/redisstack/"$FILENAME"
