# RedisEnterpriseDatabase


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uid** | **number** | The unique ID of the database. | [default to undefined]
**name** | **string** | Name of database in cluster. | [default to undefined]
**dnsName** | **string** | DNS name your Redis Enterprise cluster database is available on. | [default to undefined]
**address** | **string** | Address your Redis Enterprise cluster database is available on. | [default to undefined]
**port** | **number** | The port your Redis Enterprise cluster database is available on. | [default to undefined]
**status** | **string** | Database status | [default to StatusEnum_Active]
**modules** | **Array&lt;string&gt;** | Information about the modules loaded to the database | [default to undefined]
**tls** | **boolean** | Is TLS mode enabled? | [default to undefined]
**_options** | **object** | Additional database options | [default to undefined]
**tags** | [**Array&lt;CreateTagDto&gt;**](CreateTagDto.md) | Tags associated with the database. | [default to undefined]

## Example

```typescript
import { RedisEnterpriseDatabase } from './api';

const instance: RedisEnterpriseDatabase = {
    uid,
    name,
    dnsName,
    address,
    port,
    status,
    modules,
    tls,
    _options,
    tags,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
