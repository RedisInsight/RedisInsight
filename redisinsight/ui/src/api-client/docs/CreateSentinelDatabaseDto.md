# CreateSentinelDatabaseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**alias** | **string** | The name under which the base will be saved in the application. | [default to undefined]
**name** | **string** | Sentinel master group name. | [default to undefined]
**username** | **string** | The username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**password** | **string** | The password, if any, for your Redis database. If your database doesn’t require a password, leave this field empty. | [optional] [default to undefined]
**db** | **number** | Logical database number. | [optional] [default to undefined]

## Example

```typescript
import { CreateSentinelDatabaseDto } from './api';

const instance: CreateSentinelDatabaseDto = {
    alias,
    name,
    username,
    password,
    db,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
