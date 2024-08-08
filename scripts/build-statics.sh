#!/bin/bash
set -e

pluginsOnlyInstall="${pluginsOnlyInstall:-0}"

# =============== Plugins ===============
PLUGINS_DIR="./redisinsight/api/static/plugins"
PLUGINS_VENDOR_DIR="./redisinsight/api/static/resources/plugins"

# Default plugins assets
sass "./redisinsight/ui/src/styles/main_plugin.scss" "./vendor/global_styles.css" --style=compressed --no-source-map
sass "./redisinsight/ui/src/styles/themes/dark_theme/darkTheme.scss" "./vendor/dark_theme.css" --style=compressed --no-source-map
sass "./redisinsight/ui/src/styles/themes/light_theme/lightTheme.scss" "./vendor/light_theme.css" --style=compressed --no-source-map
cp -R "./redisinsight/ui/src/assets/fonts/graphik/" "./vendor/fonts"
cp -R "./redisinsight/ui/src/assets/fonts/inconsolata/" "./vendor/fonts"
mkdir -p "${PLUGINS_VENDOR_DIR}"
cp -R "./vendor/." "${PLUGINS_VENDOR_DIR}"

function extract_plugins {
  # use RI_BUILD_ARCHIVE_SRC_URL env variable to override default archive url
  local ARCHIVE_SRC_URL="${RI_BUILD_ARCHIVE_SRC_URL:-"https://output.circle-artifacts.com/output/job/109205c7-1885-4bd8-a914-638bd0c45fb8/artifacts/0/release/web/Redis-Insight-web-linux-musl.x64.tar.gz"}"
  local ARCHIVE_PLUGINS_DIR="api/dist/static/plugins"
  if [ "$pluginsOnlyInstall" != 1 ]; then
    # create temp dir to extract archive
    local TEMP
    TEMP="$(mktemp -d)"
    echo "Creating temp dir: $TEMP"
    mkdir -p "$TEMP"
    echo "Download static build from $ARCHIVE_SRC_URL and copy plugins into '$PLUGINS_DIR'"
    wget -cq "$ARCHIVE_SRC_URL" -O - | tar -C "$TEMP" -xz $ARCHIVE_PLUGINS_DIR
    local extracted=$?
    if [ ! $extracted -eq 0 ]; then
      echo "Failed to download RI build from $ARCHIVE_SRC_URL"
      return 1
    fi
    mkdir -p "${PLUGINS_DIR}"
    cp -R "${TEMP}/${ARCHIVE_PLUGINS_DIR}" "${PLUGINS_DIR}"

    if [ -d "${TEMP}" ]; then
      echo "$TEMP Directory exists. Deleting it"
      rm -rf "${TEMP}"
      echo "Deleted $TEMP"
    fi
    echo "Done"
  else
    echo "Skipping plugins extraction"
  fi
}

# if Extract plugins succeeds, we are done
if extract_plugins; then
  echo "Plugins were extracted successfully"
  exit 0
fi

# Build redisearch plugin
REDISEARCH_DIR="./redisinsight/ui/src/packages/redisearch"
yarn --cwd "${REDISEARCH_DIR}"
if [ $pluginsOnlyInstall != 1 ]; then
  yarn --cwd "${REDISEARCH_DIR}" build
  mkdir -p "${PLUGINS_DIR}/redisearch"
  cp -R "${REDISEARCH_DIR}/dist" "${REDISEARCH_DIR}/package.json" "${PLUGINS_DIR}/redisearch"
fi

# Build redisgraph plugin
REDISGRAPH_DIR="./redisinsight/ui/src/packages/redisgraph"
yarn --cwd "${REDISGRAPH_DIR}"
if [ $pluginsOnlyInstall != 1 ]; then
  yarn --cwd "${REDISGRAPH_DIR}" build
  mkdir -p "${PLUGINS_DIR}/redisgraph"
  cp -R "${REDISGRAPH_DIR}/dist" "${REDISGRAPH_DIR}/package.json" "${PLUGINS_DIR}/redisgraph"
fi

# Build timeseries plugin
REDISTIMESERIES_DIR="./redisinsight/ui/src/packages/redistimeseries-app"
yarn --cwd "${REDISTIMESERIES_DIR}"
if [ $pluginsOnlyInstall != 1 ]; then
  yarn --cwd "${REDISTIMESERIES_DIR}" build
  mkdir -p "${PLUGINS_DIR}/redistimeseries-app"
  cp -R "${REDISTIMESERIES_DIR}/dist" "${REDISTIMESERIES_DIR}/package.json" "${PLUGINS_DIR}/redistimeseries-app"
fi

# Build ri-explain plugin
RI_EXPLIAIN_DIR="./redisinsight/ui/src/packages/ri-explain"
yarn --cwd "${RI_EXPLIAIN_DIR}"
if [ $pluginsOnlyInstall != 1 ]; then
  yarn --cwd "${RI_EXPLIAIN_DIR}" build
  mkdir -p "${PLUGINS_DIR}/ri-explain"
  cp -R "${RI_EXPLIAIN_DIR}/dist" "${RI_EXPLIAIN_DIR}/package.json" "${PLUGINS_DIR}/ri-explain"
fi

# Build clients-list and json plugin
CLIENTS_LIST_DIR="./redisinsight/ui/src/packages/clients-list"
yarn --cwd "${CLIENTS_LIST_DIR}"
if [ $pluginsOnlyInstall != 1 ]; then
  yarn --cwd "${CLIENTS_LIST_DIR}" build
  mkdir -p "${PLUGINS_DIR}/clients-list"
  cp -R "${CLIENTS_LIST_DIR}/dist" "${CLIENTS_LIST_DIR}/package.json" "${PLUGINS_DIR}/clients-list"
fi
