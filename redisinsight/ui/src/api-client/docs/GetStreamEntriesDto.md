# GetStreamEntriesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**start** | **string** | Specifying the start id | [optional] [default to '-']
**end** | **string** | Specifying the end id | [optional] [default to '+']
**count** | **number** | Specifying the number of entries to return. | [optional] [default to 500]
**sortOrder** | **string** | Get entries sort by IDs order. | [default to SortOrderEnum_Desc]

## Example

```typescript
import { GetStreamEntriesDto } from './api';

const instance: GetStreamEntriesDto = {
    keyName,
    start,
    end,
    count,
    sortOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
