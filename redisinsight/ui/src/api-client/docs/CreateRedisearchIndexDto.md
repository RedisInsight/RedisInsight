# CreateRedisearchIndexDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**index** | **string** | Index Name | [default to undefined]
**type** | **string** | Type of keys to index | [default to undefined]
**prefixes** | **Array&lt;string&gt;** | Keys prefixes to find keys for index | [optional] [default to undefined]
**fields** | [**Array&lt;CreateRedisearchIndexFieldDto&gt;**](CreateRedisearchIndexFieldDto.md) | Fields to index | [default to undefined]

## Example

```typescript
import { CreateRedisearchIndexDto } from './api';

const instance: CreateRedisearchIndexDto = {
    index,
    type,
    prefixes,
    fields,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
