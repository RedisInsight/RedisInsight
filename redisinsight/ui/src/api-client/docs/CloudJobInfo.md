# CloudJobInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**child** | [**CloudJobInfo**](CloudJobInfo.md) | Children job if any | [optional] [default to undefined]
**error** | **object** | Error if any | [optional] [default to undefined]
**result** | **object** | Job result | [optional] [default to undefined]
**step** | **string** | Job step | [optional] [default to undefined]

## Example

```typescript
import { CloudJobInfo } from './api';

const instance: CloudJobInfo = {
    id,
    name,
    status,
    child,
    error,
    result,
    step,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
