# CloudDatabase


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**subscriptionId** | **number** | Subscription id | [default to undefined]
**subscriptionType** | **string** | Subscription type | [default to undefined]
**databaseId** | **number** | Database id | [default to undefined]
**name** | **string** | Database name | [default to undefined]
**publicEndpoint** | **string** | Address your Redis Cloud database is available on | [default to undefined]
**status** | **string** | Database status | [default to StatusEnum_Active]
**sslClientAuthentication** | **boolean** | Is ssl authentication enabled or not | [default to undefined]
**modules** | **Array&lt;string&gt;** | Information about the modules loaded to the database | [default to undefined]
**_options** | **object** | Additional database options | [default to undefined]
**tags** | [**Array&lt;Tag&gt;**](Tag.md) | Tags associated with the database. | [default to undefined]

## Example

```typescript
import { CloudDatabase } from './api';

const instance: CloudDatabase = {
    subscriptionId,
    subscriptionType,
    databaseId,
    name,
    publicEndpoint,
    status,
    sslClientAuthentication,
    modules,
    _options,
    tags,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
