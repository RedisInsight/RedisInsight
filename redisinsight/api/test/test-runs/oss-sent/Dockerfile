FROM redis:5

ENV ALLOW_EMPTY_PASSWORD=yes

ENV SENTINEL_QUORUM 2
ENV SENTINEL_DOWN_AFTER 5000
ENV SENTINEL_FAILOVER 10000
ENV SENTINEL_PORT 26000
ENV AUTH_PASS testpass
ENV REQUIREPASS=""

COPY --chown=1001 sentinel.conf /etc/redis/sentinel.conf
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
