# CreateHashWithExpireDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**fields** | [**Array&lt;HashFieldDto&gt;**](HashFieldDto.md) | Hash fields | [default to undefined]
**expire** | **number** | Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted. | [optional] [default to undefined]

## Example

```typescript
import { CreateHashWithExpireDto } from './api';

const instance: CreateHashWithExpireDto = {
    keyName,
    fields,
    expire,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
