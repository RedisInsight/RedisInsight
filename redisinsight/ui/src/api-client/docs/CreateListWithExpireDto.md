# CreateListWithExpireDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**elements** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | List element(s) | [default to undefined]
**destination** | **string** | In order to append elements to the end of the list, use the TAIL value, to prepend use HEAD value. Default: TAIL (when not specified) | [optional] [default to DestinationEnum_Tail]
**expire** | **number** | Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted. | [optional] [default to undefined]

## Example

```typescript
import { CreateListWithExpireDto } from './api';

const instance: CreateListWithExpireDto = {
    keyName,
    elements,
    destination,
    expire,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
