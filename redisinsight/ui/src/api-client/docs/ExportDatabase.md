# ExportDatabase


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Database id. | [default to undefined]
**host** | **string** | The hostname of your Redis database, for example redis.acme.com. If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost. | [default to 'localhost']
**port** | **number** | The port your Redis database is available on. | [default to 6379]
**name** | **string** | A name for your Redis database. | [default to undefined]
**db** | **number** | Logical database number. | [optional] [default to undefined]
**username** | **string** | Database username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**password** | **string** | The password, if any, for your Redis database. If your database doesn’t require a password, leave this field empty. | [optional] [default to undefined]
**connectionType** | **string** | Connection Type | [default to ConnectionTypeEnum_Standalone]
**nameFromProvider** | **string** | The database name from provider | [optional] [default to undefined]
**provider** | **string** | The redis database hosting provider | [optional] [default to undefined]
**lastConnection** | **string** | Time of the last connection to the database. | [default to undefined]
**sentinelMaster** | [**SentinelMaster**](SentinelMaster.md) | Redis OSS Sentinel master group. | [optional] [default to undefined]
**modules** | [**Array&lt;AdditionalRedisModule&gt;**](AdditionalRedisModule.md) | Loaded Redis modules. | [optional] [default to undefined]
**tls** | **boolean** | Use TLS to connect. | [optional] [default to undefined]
**tlsServername** | **string** | SNI servername | [optional] [default to undefined]
**verifyServerCert** | **boolean** | The certificate returned by the server needs to be verified. | [optional] [default to false]
**caCert** | [**CaCertificate**](CaCertificate.md) | CA Certificate | [optional] [default to undefined]
**clientCert** | [**ClientCertificate**](ClientCertificate.md) | Client Certificate | [optional] [default to undefined]
**ssh** | **boolean** | Use SSH tunnel to connect. | [optional] [default to undefined]
**sshOptions** | [**SshOptions**](SshOptions.md) | SSH options | [optional] [default to undefined]
**compressor** | **string** | Database compressor | [optional] [default to CompressorEnum_None]
**forceStandalone** | **boolean** | Force client connection as standalone | [optional] [default to undefined]
**tags** | [**Array&lt;Tag&gt;**](Tag.md) | Tags associated with the database. | [optional] [default to undefined]

## Example

```typescript
import { ExportDatabase } from './api';

const instance: ExportDatabase = {
    id,
    host,
    port,
    name,
    db,
    username,
    password,
    connectionType,
    nameFromProvider,
    provider,
    lastConnection,
    sentinelMaster,
    modules,
    tls,
    tlsServername,
    verifyServerCert,
    caCert,
    clientCert,
    ssh,
    sshOptions,
    compressor,
    forceStandalone,
    tags,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
