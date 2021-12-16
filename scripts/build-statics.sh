#!/bin/bash

# =============== Plugins ===============
PLUGINS_DIR="./redisinsight/api/static/plugins"
PLUGINS_VENDOR_DIR="./redisinsight/api/static/resources/plugins"

# Default plugins assets
node-sass "./redisinsight/ui/src/styles/main_plugin.scss" "./vendor/global_styles.css" --output-style compressed;
node-sass "./redisinsight/ui/src/styles/themes/dark_theme/_dark_theme.lazy.scss" "./vendor/dark_theme.css" --output-style compressed;
node-sass "./redisinsight/ui/src/styles/themes/light_theme/_light_theme.lazy.scss" "./vendor/light_theme.css" --output-style compressed;
cp -R "./redisinsight/ui/src/assets/fonts/graphik" "./vendor/fonts"
mkdir -p "${PLUGINS_VENDOR_DIR}"
cp -R "./vendor/." "${PLUGINS_VENDOR_DIR}"

# Build redisearch plugin
REDISEARCH_DIR="./redisinsight/ui/src/packages/redisearch"
yarn --cwd "${REDISEARCH_DIR}"
yarn --cwd "${REDISEARCH_DIR}" build
mkdir -p "${PLUGINS_DIR}/redisearch"
cp -R "${REDISEARCH_DIR}/dist" "${REDISEARCH_DIR}/package.json" "${PLUGINS_DIR}/redisearch"

# =============== Enablement area ===============
cp -R "./redisinsight/ui/src/packages/enablement-area" "./redisinsight/api/static/workbench"
