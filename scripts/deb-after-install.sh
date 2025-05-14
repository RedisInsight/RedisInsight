#!/bin/bash
set -ex

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space
NEW_INSTALL_PATH="/opt/redisinsight"   # New path without space
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Create a symlink instead of moving files
if [ -d "$OLD_INSTALL_PATH" ] && [ ! -e "$NEW_INSTALL_PATH" ]; then
    echo "Creating symlink from $NEW_INSTALL_PATH to $OLD_INSTALL_PATH"
    # Create the symlink from new location to the old one
    sudo ln -sf "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH"
fi

# Update desktop file to use new path
if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file to use new path"
    sudo sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE"
fi

# Update binary link to use the new path without spaces
sudo ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight"

# Set basic executable permissions (on the original location)
if [ -f "$OLD_INSTALL_PATH/redisinsight" ]; then
    sudo chmod +x "$OLD_INSTALL_PATH/redisinsight"
fi

# Set correct ownership and permissions for chrome-sandbox (on the original location)
if [ -f "$OLD_INSTALL_PATH/chrome-sandbox" ]; then
    sudo chown root:root "$OLD_INSTALL_PATH/chrome-sandbox"
    sudo chmod 4755 "$OLD_INSTALL_PATH/chrome-sandbox"
fi

echo "RedisInsight post-installation setup completed successfully"