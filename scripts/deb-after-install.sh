#!/bin/bash
set -ex

OLD_INSTALL_PATH="/opt/Redis Insight"
NEW_INSTALL_PATH="/opt/redisinsight"
DESKTOP_FILE="/usr/share/applications/redisinsight.desktop"
UPDATE_DIR="$HOME/.redisinsight-updates"

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

mkdir -p "$UPDATE_DIR"
chmod 755 "$UPDATE_DIR"

if [ -f "$NEW_INSTALL_PATH/resources/app-update.yml" ]; then
    mkdir -p "$HOME/.local/share/redisinsight"
    CURRENT_USER=$(logname || echo $SUDO_USER || echo $USER)

    if [ -n "$CURRENT_USER" ]; then
        sudo chown $CURRENT_USER "$NEW_INSTALL_PATH/resources/app-update.yml"
        sudo chmod 644 "$NEW_INSTALL_PATH/resources/app-update.yml"

        # Make additional update-related directories and files accessible to the user
        sudo mkdir -p "$NEW_INSTALL_PATH/resources/app.asar.unpacked"
        sudo chown -R $CURRENT_USER "$NEW_INSTALL_PATH/resources/app.asar.unpacked"
        sudo chmod -R 755 "$NEW_INSTALL_PATH/resources/app.asar.unpacked"
    fi

    cp -f "$NEW_INSTALL_PATH/resources/app-update.yml" "$UPDATE_DIR/"
fi

mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/redisinsight-process-monitor" << 'EOF'
#!/bin/bash

sleep 3
REDIS_PIDS=$(pgrep -f "redisinsight")

if [ -n "$REDIS_PIDS" ]; then
    for i in {1..30}; do
        RUNNING=false
        for PID in $REDIS_PIDS; do
            if ps -p $PID > /dev/null; then
                RUNNING=true
                break
            fi
        done

        if [ "$RUNNING" == "false" ]; then
            break
        fi

        sleep 1
    done

    for PID in $REDIS_PIDS; do
        if ps -p $PID > /dev/null; then
            kill -15 $PID 2>/dev/null || true
            sleep 2
            if ps -p $PID > /dev/null; then
                kill -9 $PID 2>/dev/null || true
            fi
        fi
    done
fi

if ! pgrep -f "redisinsight" > /dev/null; then
    nohup redisinsight > /dev/null 2>&1 &
fi
EOF

chmod +x "$HOME/.local/bin/redisinsight-process-monitor"

if [ -f "$DESKTOP_FILE" ]; then
    mkdir -p "$HOME/.local/share/applications"
    cp -f "$DESKTOP_FILE" "$HOME/.local/share/applications/redisinsight.desktop"

    sed -i 's|^Exec=redisinsight|Exec=bash -c "redisinsight & $HOME/.local/bin/redisinsight-process-monitor"|' "$HOME/.local/share/applications/redisinsight.desktop"
fi

echo "RedisInsight post-installation setup completed successfully"
