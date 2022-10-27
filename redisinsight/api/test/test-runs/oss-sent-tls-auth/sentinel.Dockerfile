FROM redis:7.0.2-alpine
COPY sentinel.conf users.acl certs/* /etc/redis/
ENTRYPOINT [ "redis-server", "/etc/redis/sentinel.conf", "--sentinel" ]
