#!/bin/bash
set -e

echo $pluginsOnlyInstall

if [ $pluginsOnlyInstall == 1 ]; then
  exit 1
fi


# =============== Plugins ===============
PLUGINS_DIR="./redisinsight/api/static/plugins"
PLUGINS_VENDOR_DIR="./redisinsight/api/static/resources/plugins"

# Default plugins assets
node-sass "./redisinsight/ui/src/styles/main_plugin.scss" "./vendor/global_styles.css" --output-style compressed;
node-sass "./redisinsight/ui/src/styles/themes/dark_theme/_dark_theme.lazy.scss" "./vendor/dark_theme.css" --output-style compressed;
node-sass "./redisinsight/ui/src/styles/themes/light_theme/_light_theme.lazy.scss" "./vendor/light_theme.css" --output-style compressed;
cp -R "./redisinsight/ui/src/assets/fonts/graphik/" "./vendor/fonts"
cp -R "./redisinsight/ui/src/assets/fonts/inconsolata/" "./vendor/fonts"
mkdir -p "${PLUGINS_VENDOR_DIR}"
cp -R "./vendor/." "${PLUGINS_VENDOR_DIR}"


# Build redisearch plugin
REDISEARCH_DIR="./redisinsight/ui/src/packages/redisearch"
yarn --cwd "${REDISEARCH_DIR}"
if [ $pluginsOnlyInstall != "1" ]; then
  yarn --cwd "${REDISEARCH_DIR}" build
  mkdir -p "${PLUGINS_DIR}/redisearch"
  cp -R "${REDISEARCH_DIR}/dist" "${REDISEARCH_DIR}/package.json" "${PLUGINS_DIR}/redisearch"
fi


# Build redisgraph plugin
REDISGRAPH_DIR="./redisinsight/ui/src/packages/redisgraph"
yarn --cwd "${REDISGRAPH_DIR}"
if [ $pluginsOnlyInstall != "1" ]; then
  yarn --cwd "${REDISGRAPH_DIR}" build
  mkdir -p "${PLUGINS_DIR}/redisgraph"
  cp -R "${REDISGRAPH_DIR}/dist" "${REDISGRAPH_DIR}/package.json" "${PLUGINS_DIR}/redisgraph"
fi

# Build timeseries plugin
REDISTIMESERIES_DIR="./redisinsight/ui/src/packages/redistimeseries-app"
yarn --cwd "${REDISTIMESERIES_DIR}"
if [ $pluginsOnlyInstall != "1" ]; then
  yarn --cwd "${REDISTIMESERIES_DIR}" build
  mkdir -p "${PLUGINS_DIR}/redistimeseries-app"
  cp -R "${REDISTIMESERIES_DIR}/dist" "${REDISTIMESERIES_DIR}/package.json" "${PLUGINS_DIR}/redistimeseries-app"
fi

# Build ri-explain plugin
RI_EXPLIAIN_DIR="./redisinsight/ui/src/packages/ri-explain"
yarn --cwd "${RI_EXPLIAIN_DIR}"
if [ $pluginsOnlyInstall != "1" ]; then
  yarn --cwd "${RI_EXPLIAIN_DIR}" build
  mkdir -p "${PLUGINS_DIR}/ri-explain"
  cp -R "${RI_EXPLIAIN_DIR}/dist" "${RI_EXPLIAIN_DIR}/package.json" "${PLUGINS_DIR}/ri-explain"
fi

# Build clients-list and json plugin
CLIENTS_LIST_DIR="./redisinsight/ui/src/packages/clients-list"
yarn --cwd "${CLIENTS_LIST_DIR}"
if [ $pluginsOnlyInstall != "1" ]; then
  yarn --cwd "${CLIENTS_LIST_DIR}" build
  mkdir -p "${PLUGINS_DIR}/clients-list"
  cp -R "${CLIENTS_LIST_DIR}/dist" "${CLIENTS_LIST_DIR}/package.json" "${PLUGINS_DIR}/clients-list"
fi
