import os
import pprint
import subprocess

import requests


# Suppress "Unverified HTTPS request" warnings
# See https://github.com/influxdata/influxdb-python/issues/240#issuecomment-140003499
# pylint: disable=no-member
requests.packages.urllib3.disable_warnings()


CREATE_SIMPLE_DB = bool(os.environ.get("CREATE_SIMPLE_DB", ""))
CREATE_CLUSTER_DB = bool(os.environ.get("CREATE_CLUSTER_DB", ""))
CREATE_TLS_DB = bool(os.environ.get("CREATE_TLS_DB", ""))
CREATE_TLS_MUTUAL_AUTH_DB = bool(os.environ.get("CREATE_TLS_MUTUAL_AUTH_DB", ""))
CREATE_MODULES_DB = bool(os.environ.get("CREATE_MODULES_DB", ""))
CREATE_CRDB = bool(os.environ.get("CREATE_CRDB", ""))
CRDB_INSTANCES = os.environ.get("CRDB_INSTANCES", "")


USERNAME = 'demo@redislabs.com'
PASSWORD = '123456'


RLEC_API_BASE_URL = 'https://localhost:9443/v1'


COMMON_REQ_PARAMS = dict(auth=(USERNAME, PASSWORD),
                         verify=False,)


def get_module_data() -> dict:
    """
    Returns a dict of module name to a dict containing:
    - module_id
    - module_name
    - module_args
    - semantic_version
    """
    resp = requests.get(url=f'{RLEC_API_BASE_URL}/modules', **COMMON_REQ_PARAMS)
    if not resp.ok:
        raise Exception(f"Failed to get modules info: {resp.status_code}: {resp.text}")
    data = resp.json()
    module_dict = {}
    for m in data:
        module_dict[m['module_name']] = {
            "module_id": m["uid"],
            "module_name": m["module_name"],
            "module_args": m["command_line_args"],
            "semantic_version": m["semantic_version"],
        }
    return module_dict


def create_db(body: dict) -> dict:
    """
    Create a bdb and return the response from the API.
    """
    resp = requests.post(url=f'{RLEC_API_BASE_URL}/bdbs',
                         json=body,
                         **COMMON_REQ_PARAMS)
    if not resp.ok:
        raise Exception(f"Failed to create db: {resp.status_code}: {resp.text}")
    data = resp.json()
    return data


def create_simple_db() -> dict:
    body = {
        "name": "testdb",
        "type": "redis",
        "memory_size": 1024 * 1024 * 1024, # 1GB
        "port": 12000
    }
    return create_db(body)


def create_cluster_db() -> dict:
    body = {
        "name": "testdb",
        "type": "redis",
        "memory_size": 1024 * 1024 * 1024, # 1GB
        "port": 12010,
        "sharding": True,
        "shards_count": 3,
        # Default OSS Redis Cluster-like hashing policy.
        # These regexes are taken from the RLEC REST API docs:
        # https://storage.googleapis.com/rlecrestapi/rest-html/http_rest_api.html#bdb (see the 'shard_key_regex' attribute)
        "shard_key_regex": [
            {"regex": ".*\\{(?<tag>.*)\\}.*" },
            {"regex": "(?<tag>.*)" }
        ],
    }
    return create_db(body)


def create_tls_db() -> dict:
    body = {
        "name": "testtlsdb",
        "type": "redis",
        "memory_size": 100000,
        "port": 12443,
        "tls_mode": "enabled",
        "enforce_client_authentication": "disabled"
    }
    return create_db(body)


def create_tls_mutual_auth_db() -> dict:
    with open('./cert.pem') as f:
        cert_str = f.read()
    body = {
        "name": "testtlsclientauthdb",
        "type": "redis",
        "memory_size": 100000,
        "port": 12465,
        "tls_mode": "enabled",
        "enforce_client_authentication": "enabled",
        "authentication_ssl_client_certs": [{
            "client_cert": cert_str,
        }]
    }
    return create_db(body)


def create_modules_db(module_info: dict) -> dict:
    body = {
        "name": "modulesdb",
        "type": "redis",
        "memory_size": 100000,
        "port": 12003,
        "module_list": [
            module_info['ft'],
            module_info['graph'],
            module_info['timeseries'],
        ]
    }
    return create_db(body)


def create_crdb() -> dict:
    cluster_fqdns = CRDB_INSTANCES.split()
    assert len(cluster_fqdns) >= 2, f"At least two clusters are needed for a CRDB, got {cluster_fqdns}"
    crdb_cli_instances_args = (f"--instance fqdn={fqdn},username={USERNAME},password={PASSWORD}"
                               for fqdn in cluster_fqdns)
    crdb_cli_instances_args = " ".join(crdb_cli_instances_args)
    crdb_cli_command = f"/opt/redislabs/bin/crdb-cli crdb create --name mycrdb --memory-size 10mb --port 12005 --replication false --shards-count 1 {crdb_cli_instances_args}"
    print("Running the following command:")
    print(crdb_cli_command)
    subprocess.run(crdb_cli_command.split())


def main():

    if CREATE_SIMPLE_DB:
        print("Creating simple db...")
        bdb = create_simple_db()
        print("done")
        pprint.pprint(bdb)
        print("\n\n")
    else:
        print("Skipping simple db")

    if CREATE_CLUSTER_DB:
        print("Creating cluster db...")
        bdb = create_cluster_db()
        print("done")
        pprint.pprint(bdb)
        print("\n\n")
    else:
        print("Skipping cluster db")

    if CREATE_TLS_DB:
        print("Creating TLS db...")
        bdb = create_tls_db()
        print("done")
        pprint.pprint(bdb)
        print("\n\n")
    else:
        print("Skipping TLS db")

    if CREATE_TLS_MUTUAL_AUTH_DB:
        print("Creating TLS mutual auth db...")
        bdb = create_tls_mutual_auth_db()
        print("done")
        pprint.pprint(bdb)
        print("\n\n")
    else:
        print("Skipping TLS mutual auth db")

    if CREATE_MODULES_DB:
        print("Getting modules info...")
        module_info = get_module_data()
        print('done')
        print("Creating modules db...")
        bdb = create_modules_db(module_info)
        print('done')
        pprint.pprint(bdb)
        print("\n\n")
    else:
        print("Skipping modules db")

    if CREATE_CRDB:
        print("Creating CRDB...")
        create_crdb()
        print('done')
        print("\n\n")
    else:
        print("Skipping CRDB")


if __name__ == '__main__':
    main()
