#!/bin/bash
set -euxo pipefail

# install deps
yarn
yarn --cwd redisinsight/api

# build
yarn build:statics
yarn build:web
yarn --cwd ./redisinsight/api build:prod
