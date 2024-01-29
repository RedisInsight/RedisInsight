#!/bin/bash
set -e

find ./release -type f -name '*.tar.gz' -execdir sh -c 'sha256sum "$1" > "$1.sha256"' _ {} \;
