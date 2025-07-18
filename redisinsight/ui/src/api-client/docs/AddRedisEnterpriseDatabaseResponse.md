# AddRedisEnterpriseDatabaseResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uid** | **number** | The unique ID of the database | [default to undefined]
**status** | **string** | Add Redis Enterprise database status | [default to StatusEnum_Success]
**message** | **string** | Message | [default to undefined]
**databaseDetails** | [**RedisEnterpriseDatabase**](RedisEnterpriseDatabase.md) | The database details. | [optional] [default to undefined]
**error** | **object** | Error | [optional] [default to undefined]

## Example

```typescript
import { AddRedisEnterpriseDatabaseResponse } from './api';

const instance: AddRedisEnterpriseDatabaseResponse = {
    uid,
    status,
    message,
    databaseDetails,
    error,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
