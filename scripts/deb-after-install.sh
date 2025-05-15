#!/bin/bash
set -ex

OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Skip migration if new structure already exists
if [ -d "$NEW_INSTALL_PATH" ]; then
    echo "New path already exists. Assuming clean install or previous fix. Skipping migration."
    exit 0
fi

# Proceed only if old path exists
if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Old path found. Migrating to new path..."
    mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH"

    if [ -f "$DESKTOP_FILE" ]; then
        echo "Updating desktop file"
        sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE"
    fi

    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight"
    chmod +x "$NEW_INSTALL_PATH/redisinsight"
    chown root:root "$NEW_INSTALL_PATH/chrome-sandbox"
    chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox"

    echo "Migration completed"
else
    echo "Neither old nor new path exists. Unexpected state. Skipping."
fi
