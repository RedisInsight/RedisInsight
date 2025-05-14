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

sudo tee /usr/bin/redisinsight > /dev/null << 'EOF'
#!/bin/bash

LOG_FILE="/tmp/redisinsight-launcher.log"
echo "$(date): Launcher started with args: $@" > "$LOG_FILE"

if [ ! -f "/opt/Redis Insight/redisinsight" ]; then
    echo "$(date): ERROR - Executable not found at /opt/Redis Insight/redisinsight" >> "$LOG_FILE"
    echo "ERROR: Executable not found. See $LOG_FILE for details."
    exit 1
fi

echo "$(date): Launching executable..." >> "$LOG_FILE"

"/opt/Redis Insight/redisinsight" "$@"
RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "$(date): Direct execution failed with code $RESULT, trying debug methods..." >> "$LOG_FILE"

    if command -v strace &>/dev/null && strace -V &>/dev/null 2>&1; then
        echo "$(date): Using strace for debugging..." >> "$LOG_FILE"
        strace -f "/opt/Redis Insight/redisinsight" "$@" 2>> "$LOG_FILE" || true
    else
        echo "$(date): strace unavailable or permission denied, retrying direct execution..." >> "$LOG_FILE"
        "/opt/Redis Insight/redisinsight" "$@"
        RESULT=$?
    fi
fi

echo "$(date): Launcher exited with code $RESULT" >> "$LOG_FILE"
exit $RESULT
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