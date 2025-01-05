#!/bin/sh

# Initializing system's secret storage
eval "$(dbus-launch --sh-syntax)"

mkdir -p ~/.cache
mkdir -p ~/.local/share/keyrings
# fix "Remote error from secret service:
# org.freedesktop.Secret.Error.IsLocked: Cannot create an item in a locked collection" issue
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"
sleep 1
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --start)"

echo "Waiting for /data/redisinsight.db to be available..."
RETRIES=10 
while [ $RETRIES -gt 0 ]; do
  if [ -f /data/redisinsight.db ]; then
    echo "/data/redisinsight.db is ready!"
    break
  fi
  echo "File not found yet, retrying... ($RETRIES retries left)"
  RETRIES=$((RETRIES - 1))
  sleep 1
done

ls -la /data || echo "/data not found or inaccessible"

exec "$@"
