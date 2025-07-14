# SlowLog


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Unique slowlog Id calculated by Redis | [default to undefined]
**time** | **number** | Time when command was executed | [default to undefined]
**durationUs** | **number** | Time needed to execute this command in microseconds | [default to undefined]
**args** | **string** | Command with args | [default to undefined]
**source** | **string** | Client that executed this command | [default to undefined]
**client** | **string** | Client name if defined | [optional] [default to undefined]

## Example

```typescript
import { SlowLog } from './api';

const instance: SlowLog = {
    id,
    time,
    durationUs,
    args,
    source,
    client,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
