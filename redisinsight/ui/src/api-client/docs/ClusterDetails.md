# ClusterDetails


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** | Redis version | [default to undefined]
**mode** | **string** | Redis mode. Currently one of: standalone, cluster or sentinel | [default to undefined]
**user** | **string** | Username from the connection or undefined in case when connected with default user | [default to undefined]
**uptimeSec** | **number** | Maximum value uptime_in_seconds from all nodes | [default to undefined]
**state** | **string** | cluster_state from CLUSTER INFO command | [default to undefined]
**slotsAssigned** | **string** | cluster_slots_assigned from CLUSTER INFO command | [default to undefined]
**slotsOk** | **string** | cluster_slots_ok from CLUSTER INFO command | [default to undefined]
**slotsPFail** | **string** | cluster_slots_pfail from CLUSTER INFO command | [default to undefined]
**slotsFail** | **string** | cluster_slots_fail from CLUSTER INFO command | [default to undefined]
**slotsUnassigned** | **string** | Calculated from (16384 - cluster_slots_assigned from CLUSTER INFO command) | [default to undefined]
**statsMessagesSent** | **string** | cluster_stats_messages_sent from CLUSTER INFO command | [default to undefined]
**statsMessagesReceived** | **string** | cluster_stats_messages_received from CLUSTER INFO command | [default to undefined]
**currentEpoch** | **string** | cluster_current_epoch from CLUSTER INFO command | [default to undefined]
**myEpoch** | **string** | cluster_my_epoch from CLUSTER INFO command | [default to undefined]
**size** | **string** | Number of shards. cluster_size from CLUSTER INFO command | [default to undefined]
**knownNodes** | **string** | All nodes number in the Cluster. cluster_known_nodes from CLUSTER INFO command | [default to undefined]
**nodes** | [**Array&lt;ClusterNodeDetails&gt;**](ClusterNodeDetails.md) | Details per each node | [default to undefined]

## Example

```typescript
import { ClusterDetails } from './api';

const instance: ClusterDetails = {
    version,
    mode,
    user,
    uptimeSec,
    state,
    slotsAssigned,
    slotsOk,
    slotsPFail,
    slotsFail,
    slotsUnassigned,
    statsMessagesSent,
    statsMessagesReceived,
    currentEpoch,
    myEpoch,
    size,
    knownNodes,
    nodes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
