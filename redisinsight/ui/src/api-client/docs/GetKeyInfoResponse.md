# GetKeyInfoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | [**CreateListWithExpireDtoElementsInner**](CreateListWithExpireDtoElementsInner.md) |  | [default to undefined]
**type** | **string** |  | [default to undefined]
**ttl** | **number** | The remaining time to live of a key. If the property has value of -1, then the key has no expiration time (no limit). | [default to undefined]
**size** | **number** | The number of bytes that a key and its value require to be stored in RAM. | [default to undefined]
**length** | **number** | The length of the value stored in a key. | [optional] [default to undefined]

## Example

```typescript
import { GetKeyInfoResponse } from './api';

const instance: GetKeyInfoResponse = {
    name,
    type,
    ttl,
    size,
    length,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
