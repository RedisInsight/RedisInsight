# ConsumerGroupDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | [**ConsumerGroupDtoName**](ConsumerGroupDtoName.md) |  | [default to undefined]
**consumers** | **number** | Number of consumers | [default to undefined]
**pending** | **number** | Number of pending messages | [default to undefined]
**smallestPendingId** | **string** | Smallest Id of the message that is pending in the group | [default to undefined]
**greatestPendingId** | **string** | Greatest Id of the message that is pending in the group | [default to undefined]
**lastDeliveredId** | **string** | Id of last delivered message | [default to undefined]

## Example

```typescript
import { ConsumerGroupDto } from './api';

const instance: ConsumerGroupDto = {
    name,
    consumers,
    pending,
    smallestPendingId,
    greatestPendingId,
    lastDeliveredId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
