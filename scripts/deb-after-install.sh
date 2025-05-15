#!/bin/bash
set -e

OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Try to gracefully terminate any running instances
if pgrep redisinsight >/dev/null; then
    echo "RedisInsight is running, attempting to terminate gracefully"
    pkill redisinsight || true
    # Give it a moment to shut down
    sleep 2
fi

# Handle update case: redisinsight exists, Redis Insight exists too
# This means that we are in an update scenario
if [ -d "$NEW_INSTALL_PATH" ] && [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Both old and new paths exist - handling update scenario"

    cp -rf "$OLD_INSTALL_PATH"/* "$NEW_INSTALL_PATH"/ || true

    rm -rf "$OLD_INSTALL_PATH" || true

    if [ -f "$DESKTOP_FILE" ]; then
        echo "Updating desktop file reference"
        sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE" || true
    fi

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true
    chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
    chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true

    echo "Update handled successfully"
    exit 0
fi

# Handle simple auto-update case: only redisinsight exists
if [ -d "$NEW_INSTALL_PATH" ] && [ ! -d "$OLD_INSTALL_PATH" ]; then
    echo "New path exists but old doesn't - likely clean install or auto-update"

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true
    chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
    chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true

    echo "Installation/update completed successfully"
    exit 0
fi

# Handle migration case: only Redis Insight exists.
#This is to ensure that if somebody updates from a very old version to a newer one, we'll still migrate it as expected
if [ ! -d "$NEW_INSTALL_PATH" ] && [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Old path found but new doesn't exist - migrating to new path"

    # Simply move the directory
    mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH" || true

    if [ -f "$DESKTOP_FILE" ]; then
        echo "Updating desktop file reference"
        sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE" || true
    fi

    # Ensure binary link and permissions
    ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true
    chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
    chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true

    echo "Migration completed successfully"
    exit 0
fi

# Neither directory exists - unexpected state
echo "Neither old nor new path exists. This is an unexpected state."
echo "Creating new installation directory as a fallback"
mkdir -p "$NEW_INSTALL_PATH" || true

# Always set up the binary link
ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true

echo "Post-installation completed with warnings"
