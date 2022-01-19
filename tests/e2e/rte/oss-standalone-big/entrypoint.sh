#!/bin/sh

echo 'Downloading .rdb file...'
curl --request GET -sL \
     --url 'https://s3.amazonaws.com/redisinsight.test/public/rte/big_db.tar.gz'\
     --output './dump.tar.gz'

echo 'Extracting .rdb file...'
tar -zxvf dump.tar.gz

exec "$@"
