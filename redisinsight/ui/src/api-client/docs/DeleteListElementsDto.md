# DeleteListElementsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**destination** | **string** | In order to remove last elements of the list, use the TAIL value, else HEAD value | [default to DestinationEnum_Tail]
**count** | **number** | Specifying the number of elements to remove from list. | [default to 1]

## Example

```typescript
import { DeleteListElementsDto } from './api';

const instance: DeleteListElementsDto = {
    keyName,
    destination,
    count,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
