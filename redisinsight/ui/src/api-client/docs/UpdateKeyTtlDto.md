# UpdateKeyTtlDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**ttl** | **number** | Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted. If the property has value of -1, then the key timeout will be removed. | [default to undefined]

## Example

```typescript
import { UpdateKeyTtlDto } from './api';

const instance: UpdateKeyTtlDto = {
    keyName,
    ttl,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
