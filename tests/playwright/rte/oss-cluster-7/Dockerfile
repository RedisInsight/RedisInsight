FROM redislabs/rejson:1.0.8 as rejson

FROM redislabs/redisearch:2.0.13 as redisearch

FROM redis:7.0.0

COPY redis.conf /etc/redis/
COPY --from=rejson /usr/lib/redis/modules/rejson.so /etc/redis/modules/
COPY --from=redisearch /usr/lib/redis/modules/redisearch.so /etc/redis/modules/

CMD [ "redis-server", "/etc/redis/redis.conf" ]
