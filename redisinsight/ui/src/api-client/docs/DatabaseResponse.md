# DatabaseResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Database id. | [default to undefined]
**host** | **string** | The hostname of your Redis database, for example redis.acme.com. If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost. | [default to 'localhost']
**port** | **number** | The port your Redis database is available on. | [default to 6379]
**name** | **string** | A name for your Redis database. | [default to undefined]
**db** | **number** | Logical database number. | [optional] [default to undefined]
**username** | **string** | Database username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**timeout** | **number** | Connection timeout | [optional] [default to 30000]
**connectionType** | **string** | Connection Type | [default to ConnectionTypeEnum_Standalone]
**nameFromProvider** | **string** | The database name from provider | [optional] [default to undefined]
**provider** | **string** | The redis database hosting provider | [optional] [default to undefined]
**lastConnection** | **string** | Time of the last connection to the database. | [default to undefined]
**createdAt** | **string** | Date of creation | [default to undefined]
**nodes** | [**Array&lt;Endpoint&gt;**](Endpoint.md) | OSS Cluster Nodes | [optional] [default to undefined]
**modules** | [**Array&lt;AdditionalRedisModule&gt;**](AdditionalRedisModule.md) | Loaded Redis modules. | [optional] [default to undefined]
**tls** | **boolean** | Use TLS to connect. | [optional] [default to undefined]
**tlsServername** | **string** | SNI servername | [optional] [default to undefined]
**verifyServerCert** | **boolean** | The certificate returned by the server needs to be verified. | [optional] [default to false]
**caCert** | [**CaCertificate**](CaCertificate.md) | CA Certificate | [optional] [default to undefined]
**clientCert** | [**ClientCertificate**](ClientCertificate.md) | Client Certificate | [optional] [default to undefined]
**_new** | **boolean** | A new created connection | [optional] [default to false]
**ssh** | **boolean** | Use SSH tunnel to connect. | [optional] [default to undefined]
**cloudDetails** | [**CloudDatabaseDetails**](CloudDatabaseDetails.md) | Cloud details | [optional] [default to undefined]
**compressor** | **string** | Database compressor | [optional] [default to CompressorEnum_None]
**keyNameFormat** | **string** | Key name format | [optional] [default to KeyNameFormatEnum_Unicode]
**version** | **string** | The version your Redis server | [optional] [default to undefined]
**forceStandalone** | **boolean** | Force client connection as standalone | [optional] [default to undefined]
**tags** | [**Array&lt;Tag&gt;**](Tag.md) | Tags associated with the database. | [optional] [default to undefined]
**isPreSetup** | **boolean** | Whether the database was created from a file or environment variables at startup | [optional] [default to undefined]
**password** | **boolean** | The database password flag (true if password was set) | [optional] [default to undefined]
**sshOptions** | [**SshOptionsResponse**](SshOptionsResponse.md) | Ssh options | [optional] [default to undefined]
**sentinelMaster** | [**SentinelMasterResponse**](SentinelMasterResponse.md) | Sentinel master | [optional] [default to undefined]

## Example

```typescript
import { DatabaseResponse } from './api';

const instance: DatabaseResponse = {
    id,
    host,
    port,
    name,
    db,
    username,
    timeout,
    connectionType,
    nameFromProvider,
    provider,
    lastConnection,
    createdAt,
    nodes,
    modules,
    tls,
    tlsServername,
    verifyServerCert,
    caCert,
    clientCert,
    _new,
    ssh,
    cloudDetails,
    compressor,
    keyNameFormat,
    version,
    forceStandalone,
    tags,
    isPreSetup,
    password,
    sshOptions,
    sentinelMaster,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
