# DatabaseOverview


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** | Redis database version | [default to undefined]
**usedMemory** | **number** | Total number of bytes allocated by Redis primary shards | [optional] [default to undefined]
**cloudDetails** | [**CloudDatabaseDetails**](CloudDatabaseDetails.md) | Cloud details | [optional] [default to undefined]
**totalKeys** | **number** | Total number of keys inside Redis primary shards | [optional] [default to undefined]
**totalKeysPerDb** | **number** | Nested object with total number of keys per logical database | [optional] [default to undefined]
**connectedClients** | **number** | Median for connected clients in the all shards | [optional] [default to undefined]
**opsPerSecond** | **number** | Sum of current commands per second in the all shards | [optional] [default to undefined]
**networkInKbps** | **number** | Sum of current network input in the all shards (kbps) | [optional] [default to undefined]
**networkOutKbps** | **number** | Sum of current network out in the all shards (kbps) | [optional] [default to undefined]
**cpuUsagePercentage** | **number** | Sum of current cpu usage in the all shards (%) | [optional] [default to undefined]
**serverName** | **string** | Database server name | [default to undefined]

## Example

```typescript
import { DatabaseOverview } from './api';

const instance: DatabaseOverview = {
    version,
    usedMemory,
    cloudDetails,
    totalKeys,
    totalKeysPerDb,
    connectedClients,
    opsPerSecond,
    networkInKbps,
    networkOutKbps,
    cpuUsagePercentage,
    serverName,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
