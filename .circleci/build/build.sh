#!/bin/bash
set -e

# install deps
yarn
yarn --cwd redisinsight/api

# build

# todo uncomment
# yarn build:statics
yarn build:ui
yarn --cwd ./redisinsight/api build:prod
