#!/bin/bash
set -ex

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space
NEW_INSTALL_PATH="/opt/redisinsight"   # New path without space
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"
UPDATE_DIR="/opt/redisinsight-updates"

# Check if old directory exists and handle it properly
if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Migrating from $OLD_INSTALL_PATH to $NEW_INSTALL_PATH"

    # Move the old installation to the new location
    sudo mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH"

    # Create a symlink from old path to new to maintain compatibility
    sudo ln -sf "$NEW_INSTALL_PATH" "$OLD_INSTALL_PATH"
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

# Create updates directory with appropriate permissions for auto-updates
if [ ! -d "$UPDATE_DIR" ]; then
    sudo mkdir -p "$UPDATE_DIR"
fi

# Get the current user to set appropriate permissions
CURRENT_USER=$(logname || echo $SUDO_USER || echo $USER)

# Set permissions to allow updates without sudo
sudo chown -R $CURRENT_USER:$(id -gn $CURRENT_USER) "$UPDATE_DIR"
sudo chmod -R 755 "$UPDATE_DIR"

# Create a symlink or ensure the app can write to the installation directory for updates
if [ -d "$NEW_INSTALL_PATH/resources" ]; then
    sudo chown -R $CURRENT_USER:$(id -gn $CURRENT_USER) "$NEW_INSTALL_PATH/resources/app-update.yml"
    sudo chmod 644 "$NEW_INSTALL_PATH/resources/app-update.yml"
fi

echo "RedisInsight post-installation setup completed successfully"
