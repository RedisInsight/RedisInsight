#!/usr/bin/env bash

curl --request GET -sL \
     --url 'https://s3.amazonaws.com/redisinsight.test/public/custom_plugins/plugins.zip'\
     --output './plugins.zip'

echo "Custom plugins archive was downloaded"

mkdir -p .redisinsight-v2
unzip -o plugins.zip -d ./.redisinsight-v2/plugins

echo "Custom plugins were unarchived"

exec "$@"
