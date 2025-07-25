# SearchZSetMembersDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**cursor** | **number** | Iteration cursor. An iteration starts when the cursor is set to 0, and terminates when the cursor returned by the server is 0. | [default to 0]
**count** | **number** | Specifying the number of elements to return. | [optional] [default to 15]
**match** | **string** | Iterate only elements matching a given pattern. | [default to '*']

## Example

```typescript
import { SearchZSetMembersDto } from './api';

const instance: SearchZSetMembersDto = {
    keyName,
    cursor,
    count,
    match,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
