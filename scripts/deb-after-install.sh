#!/bin/bash
# Exit on error but continue past command failures with || true
set -e

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space
NEW_INSTALL_PATH="/opt/redisinsight"   # New path without space
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Simple auto-update detection - if we have the new path but not the old path
if [ -d "$NEW_INSTALL_PATH" ] && [ ! -d "$OLD_INSTALL_PATH" ]; then
    echo "Auto-update scenario detected"

    # Always update the symlink
    sudo ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true

    # Set permissions only if files exist
    if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
        sudo chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
    fi

    if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
        sudo chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
        sudo chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
    fi

    echo "RedisInsight auto-update post-install completed"
    exit 0
fi

# Check if old directory exists and rename it
if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Migrating from old installation path"
    if [ -d "$NEW_INSTALL_PATH" ]; then
        echo "WARNING: Both old and new paths exist. Removing new path first."
        sudo rm -rf "$NEW_INSTALL_PATH" || true
    fi
    sudo mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH" || true
fi

# Update desktop file to use new path if it exists
if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file"
    sudo sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE" || true
fi

# Always update the symlink
sudo ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight" || true

# Set executable permissions
if [ -f "$NEW_INSTALL_PATH/redisinsight" ]; then
    sudo chmod +x "$NEW_INSTALL_PATH/redisinsight" || true
fi

# Set correct ownership and permissions for chrome-sandbox
if [ -f "$NEW_INSTALL_PATH/chrome-sandbox" ]; then
    sudo chown root:root "$NEW_INSTALL_PATH/chrome-sandbox" || true
    sudo chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox" || true
fi

echo "RedisInsight post-installation setup completed successfully"