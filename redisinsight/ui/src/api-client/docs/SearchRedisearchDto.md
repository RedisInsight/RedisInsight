# SearchRedisearchDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**index** | [**CreateRedisearchIndexDtoIndex**](CreateRedisearchIndexDtoIndex.md) |  | [default to undefined]
**query** | **string** | Query to search inside data fields | [default to undefined]
**limit** | **number** | Limit number of results to be returned | [default to undefined]
**offset** | **number** | Offset position to start searching | [default to undefined]

## Example

```typescript
import { SearchRedisearchDto } from './api';

const instance: SearchRedisearchDto = {
    index,
    query,
    limit,
    offset,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
