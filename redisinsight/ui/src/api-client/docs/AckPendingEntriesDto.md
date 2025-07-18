# AckPendingEntriesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**groupName** | [**GetConsumersDtoGroupName**](GetConsumersDtoGroupName.md) |  | [default to undefined]
**entries** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | Entries IDs | [default to undefined]

## Example

```typescript
import { AckPendingEntriesDto } from './api';

const instance: AckPendingEntriesDto = {
    keyName,
    groupName,
    entries,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
