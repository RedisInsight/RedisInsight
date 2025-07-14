# GetPendingEntriesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | **string** | Key Name | [default to undefined]
**groupName** | **string** | Consumer group name | [default to undefined]
**consumerName** | **string** | Consumer name | [default to undefined]
**start** | **string** | Specifying the start id | [optional] [default to '-']
**end** | **string** | Specifying the end id | [optional] [default to '+']
**count** | **number** | Specifying the number of pending messages to return. | [optional] [default to 500]

## Example

```typescript
import { GetPendingEntriesDto } from './api';

const instance: GetPendingEntriesDto = {
    keyName,
    groupName,
    consumerName,
    start,
    end,
    count,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
