#!/bin/bash
set -ex

OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"

# Get the actual user, even when run with sudo
REAL_USER=$(logname || echo $SUDO_USER || echo $USER)
REAL_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)

if [ -d "$OLD_INSTALL_PATH" ]; then
    echo "Migrating from $OLD_INSTALL_PATH to $NEW_INSTALL_PATH"
    sudo mv "$OLD_INSTALL_PATH" "$NEW_INSTALL_PATH"
    sudo ln -sf "$NEW_INSTALL_PATH" "$OLD_INSTALL_PATH"
fi

if [ -f "$DESKTOP_FILE" ]; then
    echo "Updating desktop file to use new path"
    sudo sed -i "s|$OLD_INSTALL_PATH|$NEW_INSTALL_PATH|g" "$DESKTOP_FILE"
fi

sudo ln -sf "$NEW_INSTALL_PATH/redisinsight" "/usr/bin/redisinsight"
sudo chmod +x "$NEW_INSTALL_PATH/redisinsight"
sudo chown root:root "$NEW_INSTALL_PATH/chrome-sandbox"
sudo chmod 4755 "$NEW_INSTALL_PATH/chrome-sandbox"

# Make update-related directories writable by the real user
sudo -u "$REAL_USER" mkdir -p "$REAL_HOME/.cache/redisinsight-updater"
sudo -u "$REAL_USER" chmod -R 755 "$REAL_HOME/.cache/redisinsight-updater"

sudo mkdir -p /usr/local/bin
sudo tee /usr/local/bin/redisinsight-update-helper > /dev/null << 'EOF'
#!/bin/bash

LOGFILE="/tmp/redisinsight-update.log"
echo "Update attempted at $(date)" >> "$LOGFILE"
echo "Arguments: $@" >> "$LOGFILE"

# return success immediately to prevent hanging
exit 0
EOF

sudo chmod +x /usr/local/bin/redisinsight-update-helper

# Make sure electron-updater uses our script instead of pkexec directly
# by creating a fake pkexec that just passes to our helper script
sudo tee /usr/local/bin/pkexec > /dev/null << 'EOF'
#!/bin/bash

if [[ "$*" == *"redisinsight"* ]] && ([[ "$*" == *"dpkg"* ]] || [[ "$*" == *"apt-get"* ]]); then
    /usr/local/bin/redisinsight-update-helper "$@"
    exit 0
else
    /usr/bin/pkexec "$@"
fi
EOF

sudo chmod +x /usr/local/bin/pkexec

# Make the application directories writable by the real user
if [ -f "$NEW_INSTALL_PATH/resources/app-update.yml" ]; then
    sudo chown "$REAL_USER" "$NEW_INSTALL_PATH/resources/app-update.yml"
    sudo chmod 644 "$NEW_INSTALL_PATH/resources/app-update.yml"

    # Make additional update-related directories and files accessible
    sudo mkdir -p "$NEW_INSTALL_PATH/resources/app.asar.unpacked"
    sudo chown -R "$REAL_USER" "$NEW_INSTALL_PATH/resources/app.asar.unpacked"
    sudo chmod -R 755 "$NEW_INSTALL_PATH/resources/app.asar.unpacked"
fi

# Create a desktop file that doesn't hang on close
sudo -u "$REAL_USER" mkdir -p "$REAL_HOME/.local/share/applications"
sudo -u "$REAL_USER" cp -f "$DESKTOP_FILE" "$REAL_HOME/.local/share/applications/redisinsight.desktop"

# Add environment variable to PATH to find our wrapper script first
echo 'export PATH="/usr/local/bin:$PATH"' | sudo tee -a /etc/profile.d/redisinsight-update-fix.sh > /dev/null
sudo chmod +x /etc/profile.d/redisinsight-update-fix.sh

echo "RedisInsight post-installation setup completed successfully"
