#!/bin/bash
set -ex

# Define paths
OLD_INSTALL_PATH="/opt/Redis Insight"  # Path with space

# Update desktop file to use executable path
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"
if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file to use executable path"
    sudo sed -i "s|Exec=.*|Exec=/usr/bin/redisinsight|g" "$DESKTOP_FILE"
fi

# Create simple launcher script that directly uses full path
sudo tee /usr/bin/redisinsight > /dev/null << 'EOF'
#!/bin/bash

echo "Launching RedisInsight with args: $@"
exec "/opt/Redis Insight/redisinsight" "$@"
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