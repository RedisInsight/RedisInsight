#!/bin/bash
set -ex

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space
NEW_INSTALL_PATH="/opt/redisinsight"   # New path without space
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Check if old directory exists and rename it
if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Renaming $OLD_INSTALL_PATH to $NEW_INSTALL_PATH"
    sudo mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH"
fi

# Update desktop file to use new path
if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file to use new path"
    sudo sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE"
fi

# Update binary link
sudo ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight"

# Set basic executable permissions
sudo chmod +x "$NEW_INSTALL_PATH/redisinsight"

# Set correct ownership and permissions for chrome-sandbox
sudo chown root:root "$NEW_INSTALL_PATH/chrome-sandbox"
sudo chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox"

echo "RedisInsight post-installation setup completed successfully"
