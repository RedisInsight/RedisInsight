FROM redislabs/rejson:1.0.8 as rejson

FROM redislabs/redisearch:2.6.5 as redisearch

FROM redis:7.0.8

COPY redis.conf /etc/redis/
COPY --from=rejson /usr/lib/redis/modules/rejson.so /etc/redis/modules/
COPY module-oss.so /etc/redis/modules/

CMD [ "redis-server", "/etc/redis/redis.conf" ]
