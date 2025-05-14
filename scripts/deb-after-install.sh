#!/bin/bash
# Use set -e, but not set -x to avoid excessive logs that might slow down the script
set -e

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space
NEW_INSTALL_PATH="/opt/redisinsight"   # New path without space
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Check for update scenario - for auto-updates, NEW_INSTALL_PATH typically already exists
if [ -d "$NEW_INSTALL_PATH" ] && [ ! -d "$OLD_INSTALL_PATH" ]; then
    echo "Auto-update detected - existing installation at $NEW_INSTALL_PATH"

    # For auto-updates, just ensure binary links and permissions are correct
    # Use timeout to prevent hanging
    timeout 10s ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true

    # Only try to set permissions if files exist
    if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
        timeout 5s chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    fi

    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        timeout 5s chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        timeout 5s chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "Auto-update post-installation completed"
    exit 0
fi

# Check if old directory exists and rename it
if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Renaming $OLD_INSTALL_PATH to $NEW_INSTALL_PATH"
    # Add timeout and fallback for safety
    timeout 30s mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH" || {
        echo "Warning: Could not move directory. It might be in use or already moved."
        # If we couldn't move, but destination exists, continue anyway
        if [ ! -d "$NEW_INSTALL_PATH" ]; then
            echo "Error: Neither source nor destination directory exists. Installation may be incomplete."
            exit 1
        fi
    }
fi

# Update desktop file to use new path if it exists
if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file to use new path"
    timeout 10s sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE" || true
fi

# Update binary link - don't use sudo if not necessary
ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true

# Set basic executable permissions if file exists
if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
    chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
fi

# Set correct ownership and permissions for chrome-sandbox if it exists
if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
    chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
    chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
fi

echo "RedisInsight post-installation setup completed successfully"