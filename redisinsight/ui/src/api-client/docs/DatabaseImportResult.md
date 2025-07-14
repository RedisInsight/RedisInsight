# DatabaseImportResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**index** | **number** | Entry index from original json | [default to undefined]
**status** | **string** | Import status | [default to undefined]
**host** | **string** | Database host | [optional] [default to undefined]
**port** | **number** | Database port | [optional] [default to undefined]
**errors** | **string** | Error message if any | [optional] [default to undefined]

## Example

```typescript
import { DatabaseImportResult } from './api';

const instance: DatabaseImportResult = {
    index,
    status,
    host,
    port,
    errors,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
