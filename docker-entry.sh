#!/bin/sh
# Entry point for distributable docker image
# This script does some setup required for bootstrapping the container
# and then runs whatever is passed as arguments to this script.
# If the CMD directive is specified in the Dockerfile, those commands
# are passed to this script. This can be overridden by the user in the
# `docker run`
set -e

echo "Running docker-entry.sh"

# Run the application's entry script with the exec command so it catches SIGTERM properly
exec "$@"
