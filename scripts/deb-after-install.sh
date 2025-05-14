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

# Log file for debugging
LOG_FILE="/tmp/redisinsight-launcher.log"

# Find the real binary
INSTALL_DIR="/opt/Redis Insight"

# Function to write to log
log() {
    echo "$(date): $1" >> "$LOG_FILE"
}

# Start with a clean log
echo "$(date): Launcher started" > "$LOG_FILE"
log "Args: $@"

# Check if the original redisinsight is a script or binary
file_type=$(file -b "$INSTALL_DIR/redisinsight" 2>/dev/null)
log "File type: $file_type"

# Detect Electron apps
if [ -f "$INSTALL_DIR/resources/electron" ]; then
    ELECTRON_PATH="$INSTALL_DIR/resources/electron"
    log "Found Electron at: $ELECTRON_PATH"

    if [ -d "$INSTALL_DIR/resources/app" ]; then
        APP_PATH="$INSTALL_DIR/resources/app"
        log "Found app directory at: $APP_PATH"
        cd "$INSTALL_DIR" && exec "$ELECTRON_PATH" "$APP_PATH" "$@"
        exit $?
    else
        log "No app directory found, executing electron directly"
        cd "$INSTALL_DIR" && exec "$ELECTRON_PATH" "$@"
        exit $?
    fi
elif [ -f "$INSTALL_DIR/redisinsight" ]; then
    # Execute the original but avoid PATH search
    log "Executing original binary with absolute path"
    cd "$INSTALL_DIR" && exec ./redisinsight.real "$@"
    exit $?
else
    log "ERROR: Could not find executable"
    echo "Error: Could not find RedisInsight executable" >&2
    exit 1
fi
EOF

# Make the launcher script executable
sudo chmod +x /usr/bin/redisinsight

# Rename the original to avoid name collision in PATH
if [ -f "$OLD_INSTALL_PATH/redisinsight" ]; then
    sudo mv "$OLD_INSTALL_PATH/redisinsight" "$OLD_INSTALL_PATH/redisinsight.real"
    sudo chmod +x "$OLD_INSTALL_PATH/redisinsight.real"
fi

# Set correct ownership and permissions for chrome-sandbox (on the original location)
if [ -f "$OLD_INSTALL_PATH/chrome-sandbox" ]; then
    sudo chown root:root "$OLD_INSTALL_PATH/chrome-sandbox"
    sudo chmod 4755 "$OLD_INSTALL_PATH/chrome-sandbox"
fi

echo "RedisInsight post-installation setup completed successfully"