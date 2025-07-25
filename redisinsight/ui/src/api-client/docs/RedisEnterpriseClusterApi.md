# RedisEnterpriseClusterApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**redisEnterpriseControllerAddRedisEnterpriseDatabases**](#redisenterprisecontrolleraddredisenterprisedatabases) | **POST** /api/redis-enterprise/cluster/databases | |
|[**redisEnterpriseControllerGetDatabases**](#redisenterprisecontrollergetdatabases) | **POST** /api/redis-enterprise/cluster/get-databases | |

# **redisEnterpriseControllerAddRedisEnterpriseDatabases**
> Array<AddRedisEnterpriseDatabaseResponse> redisEnterpriseControllerAddRedisEnterpriseDatabases(addRedisEnterpriseDatabasesDto)

Add databases from Redis Enterprise cluster

### Example

```typescript
import {
    RedisEnterpriseClusterApi,
    Configuration,
    AddRedisEnterpriseDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RedisEnterpriseClusterApi(configuration);

let addRedisEnterpriseDatabasesDto: AddRedisEnterpriseDatabasesDto; //

const { status, data } = await apiInstance.redisEnterpriseControllerAddRedisEnterpriseDatabases(
    addRedisEnterpriseDatabasesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addRedisEnterpriseDatabasesDto** | **AddRedisEnterpriseDatabasesDto**|  | |


### Return type

**Array<AddRedisEnterpriseDatabaseResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Added databases list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **redisEnterpriseControllerGetDatabases**
> Array<RedisEnterpriseDatabase> redisEnterpriseControllerGetDatabases(clusterConnectionDetailsDto)

Get all databases in the cluster.

### Example

```typescript
import {
    RedisEnterpriseClusterApi,
    Configuration,
    ClusterConnectionDetailsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RedisEnterpriseClusterApi(configuration);

let clusterConnectionDetailsDto: ClusterConnectionDetailsDto; //

const { status, data } = await apiInstance.redisEnterpriseControllerGetDatabases(
    clusterConnectionDetailsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **clusterConnectionDetailsDto** | **ClusterConnectionDetailsDto**|  | |


### Return type

**Array<RedisEnterpriseDatabase>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | All databases in the cluster. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

