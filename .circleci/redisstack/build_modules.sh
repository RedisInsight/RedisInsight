#!/bin/bash
set -e

PLATFORM=${PLATFORM:-'linux'}
ELECTRON_VERSION=$(cat electron/version)
ARCH=${ARCH:-'x64'}
#FILENAME="RedisInsight-$PLATFORM.$VERSION.$ARCH.zip"
FILENAME="RedisInsight-v2-web-$PLATFORM.$ARCH.tar.gz"

# reinstall backend prod dependencies only (optimise space)
rm -rf redisinsight/api/node_modules

npm_config_arch="$ARCH" \
npm_config_target_arch="$ARCH" \
npm_config_platform="$PLATFORM" \
npm_config_target_platform="$PLATFORM" \
yarn --cwd ./redisinsight/api install --production

cp redisinsight/api/.yarnclean.prod redisinsight/api/.yarnclean
yarn --cwd ./redisinsight/api autoclean --force

rm -rf redisinsight/build.zip

cp LICENSE ./redisinsight

cd redisinsight && tar -czvf build.tar.gz \
--exclude="api/node_modules/**/build/node_gyp_bins/python3" \
api/node_modules \
api/dist \
ui/dist \
LICENSE \
&& cd ..

mkdir -p release/redisstack
cp redisinsight/build.tar.gz release/redisstack/"$FILENAME"
