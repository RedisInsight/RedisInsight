#!/bin/sh

HOST=${1}
PORT=${2}
TIMEOUT=${TIMEOUT:-120}

echo "Waiting for redis on $HOST:$PORT... "
while [ $TIMEOUT -gt 0 ]; do
    INFO=$(echo -e "*1\r\n\$4\r\INFO\r\n" | nc $HOST $PORT | head -1)
    TIMEOUT=$((TIMEOUT - 1))

    if [ "$INFO" ]; then
      echo "Redis is available on $HOST:$PORT"
      exit 0;
    fi

    sleep 30
    echo "Waiting... (left: $TIMEOUT)"
done

echo "Unable to establish connection to $HOST:$PORT"
exit 1;
