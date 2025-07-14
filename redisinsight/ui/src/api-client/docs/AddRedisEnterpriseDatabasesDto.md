# AddRedisEnterpriseDatabasesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of your Redis Enterprise. | [default to 'localhost']
**port** | **number** | The port your Redis Enterprise cluster is available on. | [default to 9443]
**username** | **string** | The admin e-mail/username | [default to undefined]
**password** | **string** | The admin password | [default to undefined]
**uids** | **Array&lt;number&gt;** | The unique IDs of the databases. | [default to undefined]

## Example

```typescript
import { AddRedisEnterpriseDatabasesDto } from './api';

const instance: AddRedisEnterpriseDatabasesDto = {
    host,
    port,
    username,
    password,
    uids,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
