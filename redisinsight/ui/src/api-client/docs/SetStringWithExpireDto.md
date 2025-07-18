# SetStringWithExpireDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**value** | [**SetStringWithExpireDtoValue**](SetStringWithExpireDtoValue.md) |  | [default to undefined]
**expire** | **number** | Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted. | [optional] [default to undefined]

## Example

```typescript
import { SetStringWithExpireDto } from './api';

const instance: SetStringWithExpireDto = {
    keyName,
    value,
    expire,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
