#!/bin/bash
set -e

pluginsOnlyInstall="${pluginsOnlyInstall:-0}"

# =============== Plugins ===============
PLUGINS_DIR="./redisinsight/api/static/plugins"
PLUGINS_VENDOR_DIR="./redisinsight/api/static/resources/plugins"

# Default plugins assets
sass "./redisinsight/ui/src/styles/main_plugin.scss" "./vendor/global_styles.css" --style=compressed --no-source-map;
sass "./redisinsight/ui/src/styles/themes/dark_theme/darkTheme.scss" "./vendor/dark_theme.css" --style=compressed --no-source-map;
sass "./redisinsight/ui/src/styles/themes/light_theme/lightTheme.scss" "./vendor/light_theme.css" --style=compressed --no-source-map;
cp -R "./redisinsight/ui/src/assets/fonts/graphik/" "./vendor/fonts"
cp -R "./redisinsight/ui/src/assets/fonts/inconsolata/" "./vendor/fonts"
mkdir -p "${PLUGINS_VENDOR_DIR}"
cp -R "./vendor/." "${PLUGINS_VENDOR_DIR}"

# Build general plugins
GENERAL_DIR="./redisinsight/ui/src/packages/general"
yarn --cwd "${GENERAL_DIR}"
if [ $pluginsOnlyInstall != 1 ]; then
  yarn --cwd "${GENERAL_DIR}" build
  mkdir -p "${PLUGINS_DIR}/general"
  cp -R "${GENERAL_DIR}/dist" "${GENERAL_DIR}/package.json" "${PLUGINS_DIR}/general"
fi
