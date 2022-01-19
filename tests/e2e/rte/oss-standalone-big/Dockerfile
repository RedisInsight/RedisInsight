FROM redislabs/redismod

RUN apt update
RUN apt install curl -y

ADD entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["sh", "entrypoint.sh", "redis-server"]
CMD ["--loadmodule", "/usr/lib/redis/modules/redisai.so", "--loadmodule", "/usr/lib/redis/modules/redisearch.so", "--loadmodule", "/usr/lib/redis/modules/redisgraph.so", "--loadmodule", "/usr/lib/redis/modules/redistimeseries.so", "--loadmodule", "/usr/lib/redis/modules/rejson.so", "--loadmodule", "/usr/lib/redis/modules/redisbloom.so", "--loadmodule", "/usr/lib/redis/modules/redisgears.so", "Plugin", "/var/opt/redislabs/modules/rg/plugin/gears_python.so"]
