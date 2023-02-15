#!/bin/bash
set -e

cd ./release/redisstack

for f in *.tar.gz; do
  sha256sum "$f" > "$f.sha256"
done
