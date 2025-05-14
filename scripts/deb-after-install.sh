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

# Use 'stat' to check if the original executable is a script or a binary
FILE_TYPE=$(file -b "$OLD_INSTALL_PATH/redisinsight" || echo "unknown")
echo "File type: $FILE_TYPE"

# Find the real executable path
if [[ "$FILE_TYPE" == *"script"* ]]; then
    # Try to determine the actual binary referenced in the script
    POSSIBLE_BINARY=$(grep -l "electron" "$OLD_INSTALL_PATH"/* 2>/dev/null | head -n 1 || echo "")
    if [ -n "$POSSIBLE_BINARY" ] && [ -x "$POSSIBLE_BINARY" ]; then
        ACTUAL_EXECUTABLE="$POSSIBLE_BINARY"
    else
        # Check for common Electron app paths
        if [ -f "$OLD_INSTALL_PATH/resources/app/redisinsight" ] && [ -x "$OLD_INSTALL_PATH/resources/app/redisinsight" ]; then
            ACTUAL_EXECUTABLE="$OLD_INSTALL_PATH/resources/app/redisinsight"
        elif [ -f "$OLD_INSTALL_PATH/resources/electron" ] && [ -x "$OLD_INSTALL_PATH/resources/electron" ]; then
            ACTUAL_EXECUTABLE="$OLD_INSTALL_PATH/resources/electron"
        else
            ACTUAL_EXECUTABLE="$OLD_INSTALL_PATH/redisinsight"
        fi
    fi
else
    ACTUAL_EXECUTABLE="$OLD_INSTALL_PATH/redisinsight"
fi

sudo tee /usr/bin/redisinsight > /dev/null << EOF
#!/bin/bash

LOG_FILE="/tmp/redisinsight-launcher.log"
echo "\$(date): Launcher started with args: \$@" > "\$LOG_FILE"

if [ ! -f "$ACTUAL_EXECUTABLE" ]; then
    echo "\$(date): ERROR - Executable not found at $ACTUAL_EXECUTABLE" >> "\$LOG_FILE"
    echo "ERROR: Executable not found. See \$LOG_FILE for details."
    exit 1
fi

echo "\$(date): Executing $ACTUAL_EXECUTABLE directly..." >> "\$LOG_FILE"

cd "$OLD_INSTALL_PATH" && exec "$ACTUAL_EXECUTABLE" "\$@"

echo "\$(date): Launcher exited with code \$?" >> "\$LOG_FILE"
EOF

# Make the launcher script executable
sudo chmod +x /usr/bin/redisinsight

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