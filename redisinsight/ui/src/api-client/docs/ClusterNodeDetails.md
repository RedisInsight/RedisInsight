# ClusterNodeDetails


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Node id | [default to undefined]
**version** | **string** | Redis version | [default to undefined]
**mode** | **string** | Redis mode | [default to undefined]
**host** | **string** | Node IP address | [default to undefined]
**port** | **number** | Node IP address | [default to undefined]
**role** | **string** | Node role in cluster | [default to undefined]
**primary** | **string** | ID of primary node (for replica only) | [optional] [default to undefined]
**health** | **string** | Node\&#39;s current health status | [default to undefined]
**slots** | **Array&lt;string&gt;** | Array of assigned slots or slots ranges. Shown for primary nodes only | [optional] [default to undefined]
**totalKeys** | **number** | Total keys stored inside this node | [default to undefined]
**usedMemory** | **number** | Memory used by node. \&quot;memory.used_memory\&quot; from INFO command | [default to undefined]
**opsPerSecond** | **number** | Current operations per second. \&quot;stats.instantaneous_ops_per_sec\&quot; from INFO command | [default to undefined]
**connectionsReceived** | **number** | Total connections received by node. \&quot;stats.total_connections_received\&quot; from INFO command | [default to undefined]
**connectedClients** | **number** | Currently connected clients. \&quot;clients.connected_clients\&quot; from INFO command | [default to undefined]
**commandsProcessed** | **number** | Total commands processed by node. \&quot;stats.total_commands_processed\&quot; from INFO command | [default to undefined]
**networkInKbps** | **number** | Current input network usage in KB/s. \&quot;stats.instantaneous_input_kbps\&quot; from INFO command | [default to undefined]
**networkOutKbps** | **number** | Current output network usage in KB/s. \&quot;stats.instantaneous_output_kbps\&quot; from INFO command | [default to undefined]
**cacheHitRatio** | **number** | Ratio for cache hits and misses [0 - 1]. Ideally should be close to 1 | [optional] [default to undefined]
**replicationOffset** | **number** | The replication offset of this node. This information can be used to send commands to the most up to date replicas. | [default to undefined]
**replicationLag** | **number** | For replicas only. Determines on how much replica is behind of primary. | [optional] [default to undefined]
**uptimeSec** | **number** | Current node uptime_in_seconds | [default to undefined]
**replicas** | [**Array&lt;ClusterNodeDetails&gt;**](ClusterNodeDetails.md) | For primary nodes only. Replica node(s) details | [optional] [default to undefined]

## Example

```typescript
import { ClusterNodeDetails } from './api';

const instance: ClusterNodeDetails = {
    id,
    version,
    mode,
    host,
    port,
    role,
    primary,
    health,
    slots,
    totalKeys,
    usedMemory,
    opsPerSecond,
    connectionsReceived,
    connectedClients,
    commandsProcessed,
    networkInKbps,
    networkOutKbps,
    cacheHitRatio,
    replicationOffset,
    replicationLag,
    uptimeSec,
    replicas,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
