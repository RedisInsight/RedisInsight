#!/bin/sh

echo 'Try to sleep for a while...'
sleep 25
echo 'Creating cluster...'
echo "yes" | redis-cli \
  --cluster create \
  172.31.100.211:6379 \
  172.31.100.212:6379 \
  172.31.100.213:6379 \
  --cluster-replicas 0 \
  && redis-server
