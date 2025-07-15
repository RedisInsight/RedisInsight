# UpdateConsumerGroupDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**name** | [**GetConsumersDtoGroupName**](GetConsumersDtoGroupName.md) |  | [default to undefined]
**lastDeliveredId** | **string** | Id of last delivered message | [default to undefined]

## Example

```typescript
import { UpdateConsumerGroupDto } from './api';

const instance: UpdateConsumerGroupDto = {
    keyName,
    name,
    lastDeliveredId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
