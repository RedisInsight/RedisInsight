# CloudAuthResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Authentication status | [default to undefined]
**message** | **string** | Success or informational message | [optional] [default to undefined]
**error** | [**CloudAuthResponseError**](CloudAuthResponseError.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CloudAuthResponse } from './api';

const instance: CloudAuthResponse = {
    status,
    message,
    error,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
