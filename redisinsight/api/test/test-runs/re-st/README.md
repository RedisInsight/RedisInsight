# docker-redisenterprise-testdb
A Docker container that creates test databases on a Redis Enterprise cluster


## Databases

Environment variable control which dbs are created. By default, no db is created.
- `CREATE_SIMPLE_DB`: Single-shard simple database on port 12000
- `CREATE_CLUSTER_DB`: Database-clustering enabled, with 3 shards on port 12010
- `CREATE_TLS_DB`: Single-shard TLS database on port 12443
- `CREATE_TLS_MUTUAL_AUTH_DB`: Single-shard TLS client authentication enabled database on port 12465
- `CREATE_MODULES_DB`: Single-shard db with modules: RedisGraph, RediSearch and RedisTimeSeries on port 12003
- `CREATE_CRDB`: CRDT database on port 12005. `CRDB_INSTANCES` env var should also be set to a space-separated list of the FQDNs of participating clusters.


## References

- [Redis Enterprise REST API Docs](https://storage.googleapis.com/rlecrestapi/rest-html/http_rest_api.html)
