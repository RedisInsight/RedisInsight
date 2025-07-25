# ClusterDetails


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** | Redis version | [default to undefined]
**mode** | **string** | Redis mode. Currently one of: standalone, cluster or sentinel | [default to undefined]
**user** | **string** | Username from the connection or undefined in case when connected with default user | [optional] [default to undefined]
**uptimeSec** | **number** | Maximum value uptime_in_seconds from all nodes | [default to undefined]
**state** | **string** | cluster_state from CLUSTER INFO command | [default to undefined]
**slotsAssigned** | **number** | cluster_slots_assigned from CLUSTER INFO command | [default to undefined]
**slotsOk** | **number** | cluster_slots_ok from CLUSTER INFO command | [default to undefined]
**slotsPFail** | **number** | cluster_slots_pfail from CLUSTER INFO command | [default to undefined]
**slotsFail** | **number** | cluster_slots_fail from CLUSTER INFO command | [default to undefined]
**slotsUnassigned** | **number** | Calculated from (16384 - cluster_slots_assigned from CLUSTER INFO command) | [default to undefined]
**statsMessagesSent** | **number** | cluster_stats_messages_sent from CLUSTER INFO command | [default to undefined]
**statsMessagesReceived** | **number** | cluster_stats_messages_received from CLUSTER INFO command | [default to undefined]
**currentEpoch** | **number** | cluster_current_epoch from CLUSTER INFO command | [default to undefined]
**myEpoch** | **number** | cluster_my_epoch from CLUSTER INFO command | [default to undefined]
**size** | **number** | Number of shards. cluster_size from CLUSTER INFO command | [default to undefined]
**knownNodes** | **number** | All nodes number in the Cluster. cluster_known_nodes from CLUSTER INFO command | [default to undefined]
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
