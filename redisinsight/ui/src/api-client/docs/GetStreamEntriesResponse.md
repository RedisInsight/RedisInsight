# GetStreamEntriesResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**PushListElementsResponseKeyName**](PushListElementsResponseKeyName.md) |  | [default to undefined]
**total** | **number** | Total number of entries | [default to undefined]
**lastGeneratedId** | **string** | Last generated id in the stream | [default to undefined]
**firstEntry** | [**StreamEntryDto**](StreamEntryDto.md) | First stream entry | [default to undefined]
**lastEntry** | [**StreamEntryDto**](StreamEntryDto.md) | Last stream entry | [default to undefined]
**entries** | [**Array&lt;StreamEntryDto&gt;**](StreamEntryDto.md) | Stream entries | [default to undefined]

## Example

```typescript
import { GetStreamEntriesResponse } from './api';

const instance: GetStreamEntriesResponse = {
    keyName,
    total,
    lastGeneratedId,
    firstEntry,
    lastEntry,
    entries,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
