# SentinelMaster


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Sentinel master group name. Identifies a group of Redis instances composed of a master and one or more slaves. | [default to undefined]
**username** | **string** | Sentinel username, if your database is ACL enabled, otherwise leave this field empty. | [optional] [default to undefined]
**password** | **string** | The password for your Redis Sentinel master. If your master doesn’t require a password, leave this field empty. | [optional] [default to undefined]
**host** | **string** | The hostname of Sentinel master. | [optional] [default to 'localhost']
**port** | **number** | The port Sentinel master. | [optional] [default to 6379]
**status** | **string** | Sentinel master status | [optional] [default to StatusEnum_Active]
**numberOfSlaves** | **number** | The number of slaves. | [optional] [default to 0]
**nodes** | [**Array&lt;Endpoint&gt;**](Endpoint.md) | Sentinel master endpoints. | [optional] [default to undefined]

## Example

```typescript
import { SentinelMaster } from './api';

const instance: SentinelMaster = {
    name,
    username,
    password,
    host,
    port,
    status,
    numberOfSlaves,
    nodes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
