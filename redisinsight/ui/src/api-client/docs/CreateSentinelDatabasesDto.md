# CreateSentinelDatabasesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of your Redis database, for example redis.acme.com. If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost. | [default to 'localhost']
**port** | **number** | The port your Redis database is available on. | [default to 6379]
**db** | **number** | Logical database number. | [optional] [default to undefined]
**username** | **string** | Database username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**password** | **string** | The password, if any, for your Redis database. If your database doesn’t require a password, leave this field empty. | [optional] [default to undefined]
**timeout** | **number** | Connection timeout | [optional] [default to 30000]
**nameFromProvider** | **string** | The database name from provider | [optional] [default to undefined]
**provider** | **string** | The redis database hosting provider | [optional] [default to undefined]
**sentinelMaster** | [**SentinelMaster**](SentinelMaster.md) | Redis OSS Sentinel master group. | [optional] [default to undefined]
**tls** | **boolean** | Use TLS to connect. | [optional] [default to undefined]
**tlsServername** | **string** | SNI servername | [optional] [default to undefined]
**verifyServerCert** | **boolean** | The certificate returned by the server needs to be verified. | [optional] [default to false]
**ssh** | **boolean** | Use SSH tunnel to connect. | [optional] [default to undefined]
**cloudDetails** | [**CloudDatabaseDetails**](CloudDatabaseDetails.md) | Cloud details | [optional] [default to undefined]
**compressor** | **string** | Database compressor | [optional] [default to CompressorEnum_None]
**keyNameFormat** | **string** | Key name format | [optional] [default to KeyNameFormatEnum_Unicode]
**forceStandalone** | **boolean** | Force client connection as standalone | [optional] [default to undefined]
**caCert** | [**CreateDatabaseDtoCaCert**](CreateDatabaseDtoCaCert.md) |  | [optional] [default to undefined]
**clientCert** | [**CreateDatabaseDtoClientCert**](CreateDatabaseDtoClientCert.md) |  | [optional] [default to undefined]
**sshOptions** | [**CreateDatabaseDtoSshOptions**](CreateDatabaseDtoSshOptions.md) |  | [optional] [default to undefined]
**tags** | [**Array&lt;CreateTagDto&gt;**](CreateTagDto.md) | Tags associated with the database. | [optional] [default to undefined]
**masters** | [**Array&lt;CreateSentinelDatabaseDto&gt;**](CreateSentinelDatabaseDto.md) | The Sentinel master group list. | [default to undefined]

## Example

```typescript
import { CreateSentinelDatabasesDto } from './api';

const instance: CreateSentinelDatabasesDto = {
    host,
    port,
    db,
    username,
    password,
    timeout,
    nameFromProvider,
    provider,
    sentinelMaster,
    tls,
    tlsServername,
    verifyServerCert,
    ssh,
    cloudDetails,
    compressor,
    keyNameFormat,
    forceStandalone,
    caCert,
    clientCert,
    sshOptions,
    tags,
    masters,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
