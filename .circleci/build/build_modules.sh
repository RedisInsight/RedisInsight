#!/bin/bash
set -e

PLATFORM=${PLATFORM:-'linux'}
ARCH=${ARCH:-'x64'}
LIBC=${LIBC:-''}
#FILENAME="RedisInsight-$PLATFORM.$VERSION.$ARCH.zip"
FILENAME="RedisInsight-web-$PLATFORM"
if [ ! -z $LIBC ]
then
  FILENAME="$FILENAME-$LIBC.$ARCH.tar.gz"
  export npm_config_target_libc="$LIBC"
else
  FILENAME="$FILENAME.$ARCH.tar.gz"
fi

echo "Building node modules..."
echo "Platform: $PLATFORM"
echo "Arch: $ARCH"
echo "Libc: $LIBC"
echo "npm target libc: $npm_config_target_libc"
echo "Filname: $FILENAME"

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

cd redisinsight && tar -czf build.tar.gz \
--exclude="api/node_modules/**/build/node_gyp_bins/python3" \
api/node_modules \
api/dist \
ui/dist \
LICENSE \
&& cd ..

mkdir -p release/web
cp redisinsight/build.tar.gz release/web/"$FILENAME"
