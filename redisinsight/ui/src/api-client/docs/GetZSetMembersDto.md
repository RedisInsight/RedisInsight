# GetZSetMembersDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**offset** | **number** | Specifying the number of elements to skip. | [default to undefined]
**count** | **number** | Specifying the number of elements to return from starting at offset. | [default to 15]
**sortOrder** | **string** | Get elements sorted by score. In order to sort the members from the highest to the lowest score, use the DESC value, else ASC value | [default to SortOrderEnum_Desc]

## Example

```typescript
import { GetZSetMembersDto } from './api';

const instance: GetZSetMembersDto = {
    keyName,
    offset,
    count,
    sortOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
