# UpdateSentinelMasterDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**username** | **string** | Sentinel username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**password** | **string** | The password for your Redis Sentinel master. If your master doesn’t require a password, leave this field empty. | [optional] [default to undefined]

## Example

```typescript
import { UpdateSentinelMasterDto } from './api';

const instance: UpdateSentinelMasterDto = {
    username,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
