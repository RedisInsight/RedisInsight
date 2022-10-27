FROM redis:7.0.2-alpine
COPY redis.conf users.acl certs/* /etc/redis/
ENTRYPOINT [ "redis-server", "/etc/redis/redis.conf" ]
