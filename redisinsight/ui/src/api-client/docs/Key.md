# Key


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**type** | **string** | Key type | [default to undefined]
**memory** | **number** | Memory used by key in bytes | [default to undefined]
**length** | **number** | Number of characters, elements, etc. based on type | [default to undefined]
**ttl** | **number** | Key ttl | [default to undefined]

## Example

```typescript
import { Key } from './api';

const instance: Key = {
    name,
    type,
    memory,
    length,
    ttl,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
