# UpdateDatabaseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of your Redis database, for example redis.acme.com. If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost. | [optional] [default to 'localhost']
**port** | **number** | The port your Redis database is available on. | [optional] [default to 6379]
**name** | **string** | A name for your Redis database. | [optional] [default to undefined]
**db** | **number** | Logical database number. | [optional] [default to undefined]
**username** | **string** | Database username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**password** | **string** | The password, if any, for your Redis database. If your database doesn’t require a password, leave this field empty. | [optional] [default to undefined]
**nameFromProvider** | **string** | The database name from provider | [optional] [default to undefined]
**provider** | **string** | The redis database hosting provider | [optional] [default to undefined]
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
**tags** | [**Array&lt;CreateTagDto&gt;**](CreateTagDto.md) | Tags associated with the database. | [optional] [default to undefined]
**sshOptions** | [**UpdateSshOptionsDto**](UpdateSshOptionsDto.md) | Updated ssh options fields | [optional] [default to undefined]
**timeout** | **number** | Connection timeout | [optional] [default to undefined]
**sentinelMaster** | [**UpdateSentinelMasterDto**](UpdateSentinelMasterDto.md) | Updated sentinel master fields | [optional] [default to undefined]

## Example

```typescript
import { UpdateDatabaseDto } from './api';

const instance: UpdateDatabaseDto = {
    host,
    port,
    name,
    db,
    username,
    password,
    nameFromProvider,
    provider,
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
    tags,
    sshOptions,
    timeout,
    sentinelMaster,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
