#! /bin/bash

set -e

# enable job control
set -m

/opt/start.sh &

# This command queries the REST API and outputs the status code
CURL_CMD="curl --silent --fail --output /dev/null -i -w %{http_code} -u demo@redislabs.com:123456 -k https://localhost:9443/v1/nodes"

# Wait to get 2 consecutive 200 responses from the REST API
while true
do
    echo yay $CURL_CMD
    CURL_CMD_OUTPUT=$($CURL_CMD || true)
    if [ $CURL_CMD_OUTPUT == "200" ]
    then
        echo "Got 200 response, trying again in 5 seconds to verify..."
        sleep 5
        if [ $($CURL_CMD || true) == "200" ]
        then
            echo "Got 200 response after 5 seconds again, proceeding..."
            break
        fi
    else
        echo "Did not get 200 response, got $CURL_CMD_OUTPUT, trying again in 10 seconds..."
        sleep 10
    fi
done

echo "Running Python script to create databases..."
python3 create_dbs.py


# now we bring the primary process back into the foreground
# and leave it there
fg
