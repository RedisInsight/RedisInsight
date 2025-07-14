# RedisDatabaseInfoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** | Redis database version | [default to undefined]
**role** | **string** | Value is \&quot;master\&quot; if the instance is replica of no one, or \&quot;slave\&quot; if the instance is a replica of some master instance | [optional] [default to RoleEnum_Master]
**server** | **object** | Redis database info from server section | [optional] [default to undefined]
**stats** | [**RedisDatabaseStatsDto**](RedisDatabaseStatsDto.md) | Various Redis stats | [optional] [default to undefined]
**databases** | **number** | The number of Redis databases | [optional] [default to 16]
**usedMemory** | **number** | Total number of bytes allocated by Redis using | [optional] [default to undefined]
**totalKeys** | **number** | Total number of keys inside Redis database | [optional] [default to undefined]
**connectedClients** | **number** | Number of client connections (excluding connections from replicas) | [optional] [default to undefined]
**uptimeInSeconds** | **number** | Number of seconds since Redis server start | [optional] [default to undefined]
**hitRatio** | **number** | The cache hit ratio represents the efficiency of cache usage | [optional] [default to undefined]
**cashedScripts** | **number** | The number of the cached lua scripts | [optional] [default to undefined]
**nodes** | [**Array&lt;RedisNodeInfoResponse&gt;**](RedisNodeInfoResponse.md) | Nodes info | [optional] [default to undefined]

## Example

```typescript
import { RedisDatabaseInfoResponse } from './api';

const instance: RedisDatabaseInfoResponse = {
    version,
    role,
    server,
    stats,
    databases,
    usedMemory,
    totalKeys,
    connectedClients,
    uptimeInSeconds,
    hitRatio,
    cashedScripts,
    nodes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
