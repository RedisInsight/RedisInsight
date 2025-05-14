#!/bin/bash
set -ex

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space
NEW_INSTALL_PATH="/opt/redisinsight"   # New path without space
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"
ALTERNATIVES_PATH="/etc/alternatives/redisinsight"

# Check if old directory exists and handle it properly
if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Migrating from $OLD_INSTALL_PATH to $NEW_INSTALL_PATH"

    # Move the old installation to the new location
    sudo mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH"

    # Fix the alternatives symlink (critical for updates)
    if [ -L "$ALTERNATIVES_PATH" ]; then
        sudo rm "$ALTERNATIVES_PATH"
        sudo ln -s "$NEW_INSTALL_PATH/redisinsight" "$ALTERNATIVES_PATH"
    fi

    # Also update the direct /usr/bin symlink just to be sure
    sudo ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight"
fi

# Update desktop file to use new path
if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file to use new path"
    sudo sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE"
fi

# Set basic executable permissions
sudo chmod +x "$NEW_INSTALL_PATH/redisinsight"

# Set correct ownership and permissions for chrome-sandbox
sudo chown root:root "$NEW_INSTALL_PATH/chrome-sandbox"
sudo chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox"

# Fix paths in the update config if it exists
if [ -f "$NEW_INSTALL_PATH/resources/app-update.yml" ]; then
    sudo sed -i "s|/opt/Redis Insight|/opt/redisinsight|g" "$NEW_INSTALL_PATH/resources/app-update.yml"
fi

echo "RedisInsight post-installation setup completed successfully"
