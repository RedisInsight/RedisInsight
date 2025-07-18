# PendingEntryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Entry ID | [default to undefined]
**consumerName** | [**GetPendingEntriesDtoConsumerName**](GetPendingEntriesDtoConsumerName.md) |  | [default to undefined]
**idle** | **number** | The number of milliseconds that elapsed since the last time this message was delivered to this consumer | [default to undefined]
**delivered** | **number** | The number of times this message was delivered | [default to undefined]

## Example

```typescript
import { PendingEntryDto } from './api';

const instance: PendingEntryDto = {
    id,
    consumerName,
    idle,
    delivered,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
