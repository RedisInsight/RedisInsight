#!/bin/bash
cd ./release

for f in *.tar.gz; do
  sha256sum "$f" > "$f.sha256"
done
