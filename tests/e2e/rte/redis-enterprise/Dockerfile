FROM redislabs/redis:6.0.8-28.bionic

# Change user to root to install pip
USER root
RUN set -ex \
    && apt-get update \
    && apt-get install -y python3-pip \
    && pip3 install requests
# Change user back to redislabs
USER redislabs

# Set the env var to instruct RE to create a cluster on startup
ENV BOOTSTRAP_ACTION create_cluster
ENV BOOTSTRAP_CLUSTER_FQDN cluster.local

COPY run_re_and_create_db.sh run_re_and_create_db.sh
COPY create_dbs.py create_dbs.py
COPY cert.pem cert.pem

ENTRYPOINT [ "bash", "./run_re_and_create_db.sh" ]
