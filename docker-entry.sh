#!/bin/sh
# Entry point for distributable docker image
# This script does some setup required for bootstrapping the container
# and then runs whatever is passed as arguments to this script.
# If the CMD directive is specified in the Dockerfile, those commands
# are passed to this script. This can be overridden by the user in the
# `docker run`
set -e

# Set up mDNS functionality, to play well with Redis Enterprise
# clusters on the network. Also, run it as a non-root user.
# https://linux.die.net/man/8/avahi-daemon
avahi-daemon --daemonize --no-drop-root

# Launching system's secret storage
eval "$(dbus-launch --sh-syntax)"
mkdir -p ~/.cache
mkdir -p ~/.local/share/keyrings # where the automatic keyring is created
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"
sleep 1
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --start)"

# Run the application's entry script with the exec command so it catches SIGTERM properly
exec "$@"
