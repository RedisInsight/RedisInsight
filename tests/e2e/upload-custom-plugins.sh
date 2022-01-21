#!/usr/bin/env bash

curl --request GET -sL \
     --url 'https://s3.amazonaws.com/redisinsight.test/public/custom_plugins/plugins.zip'\
     --output './plugins.zip'

echo "Custom plugins archive was downloaded"

unzip -o plugins.zip -d ./plugins

echo "Custom plugins were unarchived"

exec "$@"
