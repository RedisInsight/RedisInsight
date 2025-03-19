#!/bin/bash

# Create directory and set write permissions
mkdir -p "rihomedir"
chmod +w rihomedir/

# Display options to the user
echo "Choose an option:"
echo "1) Start Redis databases without Redis Insight UI"
echo "2) Start Redis databases and Redis Insight UI - docker container must be loaded"
read -p "Enter your choice [1 or 2]: " choice

# Execute based on user choice
if [ "$choice" == "1" ]; then
    echo "Starting environment without Redis Insight UI..."
    docker compose -p test-docker -f rte.docker-compose.yml up -d
elif [ "$choice" == "2" ]; then
    echo "Starting environment with Redis Insight UI..."
    docker compose -p test-docker -f rte.docker-compose.yml -f local.web.docker-compose.yml up -d
else
    echo "Invalid option. Please enter 1 or 2."
    exit 1
fi
