# CreateSentinelDatabaseResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Database instance id. | [optional] [default to undefined]
**name** | **string** | Sentinel master group name. | [default to undefined]
**status** | **string** | Add Sentinel Master status | [default to StatusEnum_Success]
**message** | **string** | Message | [default to undefined]
**error** | **object** | Error | [optional] [default to undefined]

## Example

```typescript
import { CreateSentinelDatabaseResponse } from './api';

const instance: CreateSentinelDatabaseResponse = {
    id,
    name,
    status,
    message,
    error,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
