#!/usr/bin/env bash

curl --request GET -sL \
     --url 'https://s3.amazonaws.com/redisinsight.test/public/custom_plugins/plugins.zip'\
     --output './plugins.zip'

unzip plugins.zip -d ./plugins
