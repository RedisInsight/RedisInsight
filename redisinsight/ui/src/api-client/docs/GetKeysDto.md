# GetKeysDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cursor** | **string** | Iteration cursor. An iteration starts when the cursor is set to 0, and terminates when the cursor returned by the server is 0. | [default to '0']
**count** | **number** | Specifying the number of elements to return. | [optional] [default to 15]
**match** | **string** | Iterate only elements matching a given pattern. | [optional] [default to '*']
**type** | **string** | Iterate through the database looking for keys of a specific type. | [optional] [default to undefined]
**keysInfo** | **boolean** | Fetch keys info (type, size, ttl, length) | [optional] [default to true]
**scanThreshold** | **number** | The maximum number of keys to scan | [optional] [default to undefined]

## Example

```typescript
import { GetKeysDto } from './api';

const instance: GetKeysDto = {
    cursor,
    count,
    match,
    type,
    keysInfo,
    scanThreshold,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
