# PushElementToListDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**elements** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | List element(s) | [default to undefined]
**destination** | **string** | In order to append elements to the end of the list, use the TAIL value, to prepend use HEAD value. Default: TAIL (when not specified) | [optional] [default to DestinationEnum_Tail]

## Example

```typescript
import { PushElementToListDto } from './api';

const instance: PushElementToListDto = {
    keyName,
    elements,
    destination,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
