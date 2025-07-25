# ClaimPendingEntryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**groupName** | [**GetConsumersDtoGroupName**](GetConsumersDtoGroupName.md) |  | [default to undefined]
**consumerName** | [**GetPendingEntriesDtoConsumerName**](GetPendingEntriesDtoConsumerName.md) |  | [default to undefined]
**minIdleTime** | **number** | Claim only if its idle time is greater the minimum idle time  | [default to 0]
**entries** | **Array&lt;string&gt;** | Entries IDs | [default to undefined]
**idle** | **number** | Set the idle time (last time it was delivered) of the message | [optional] [default to undefined]
**time** | **number** | This is the same as IDLE but instead of a relative amount of milliseconds, it sets the idle time to a specific Unix time (in milliseconds) | [optional] [default to undefined]
**retryCount** | **number** | Set the retry counter to the specified value. This counter is incremented every time a message is delivered again. Normally XCLAIM does not alter this counter, which is just served to clients when the XPENDING command is called: this way clients can detect anomalies, like messages that are never processed for some reason after a big number of delivery attempts | [optional] [default to undefined]
**force** | **boolean** | Creates the pending message entry in the PEL even if certain specified IDs are not already in the PEL assigned to a different client | [optional] [default to undefined]

## Example

```typescript
import { ClaimPendingEntryDto } from './api';

const instance: ClaimPendingEntryDto = {
    keyName,
    groupName,
    consumerName,
    minIdleTime,
    entries,
    idle,
    time,
    retryCount,
    force,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
