# RedisDatabaseStatsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**instantaneous_input_kbps** | **string** |  | [default to undefined]
**instantaneous_ops_per_sec** | **string** |  | [default to undefined]
**instantaneous_output_kbps** | **string** |  | [default to undefined]
**maxmemory_policy** | **number** |  | [default to undefined]
**numberOfKeysRange** | **string** | Redis database mode | [default to undefined]
**uptime_in_days** | **string** | Redis database role | [default to undefined]

## Example

```typescript
import { RedisDatabaseStatsDto } from './api';

const instance: RedisDatabaseStatsDto = {
    instantaneous_input_kbps,
    instantaneous_ops_per_sec,
    instantaneous_output_kbps,
    maxmemory_policy,
    numberOfKeysRange,
    uptime_in_days,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
