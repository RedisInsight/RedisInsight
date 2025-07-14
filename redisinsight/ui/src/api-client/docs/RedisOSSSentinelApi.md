# RedisOSSSentinelApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**redisSentinelControllerAddSentinelMasters**](#redissentinelcontrolleraddsentinelmasters) | **POST** /api/redis-sentinel/databases | |
|[**redisSentinelControllerGetMasters**](#redissentinelcontrollergetmasters) | **POST** /api/redis-sentinel/get-databases | |

# **redisSentinelControllerAddSentinelMasters**
> Array<CreateSentinelDatabaseResponse> redisSentinelControllerAddSentinelMasters(createSentinelDatabasesDto)

Add masters from Redis Sentinel

### Example

```typescript
import {
    RedisOSSSentinelApi,
    Configuration,
    CreateSentinelDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RedisOSSSentinelApi(configuration);

let createSentinelDatabasesDto: CreateSentinelDatabasesDto; //

const { status, data } = await apiInstance.redisSentinelControllerAddSentinelMasters(
    createSentinelDatabasesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSentinelDatabasesDto** | **CreateSentinelDatabasesDto**|  | |


### Return type

**Array<CreateSentinelDatabaseResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Ok |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **redisSentinelControllerGetMasters**
> Array<SentinelMaster> redisSentinelControllerGetMasters(discoverSentinelMastersDto)

Get master groups

### Example

```typescript
import {
    RedisOSSSentinelApi,
    Configuration,
    DiscoverSentinelMastersDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RedisOSSSentinelApi(configuration);

let discoverSentinelMastersDto: DiscoverSentinelMastersDto; //

const { status, data } = await apiInstance.redisSentinelControllerGetMasters(
    discoverSentinelMastersDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **discoverSentinelMastersDto** | **DiscoverSentinelMastersDto**|  | |


### Return type

**Array<SentinelMaster>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

