# DatabaseInstancesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**databaseInfoControllerGetDatabaseIndex**](#databaseinfocontrollergetdatabaseindex) | **GET** /api/databases/{id}/db/{index} | |
|[**databaseInfoControllerGetDatabaseOverview**](#databaseinfocontrollergetdatabaseoverview) | **GET** /api/databases/{id}/overview | |
|[**databaseInfoControllerGetInfo**](#databaseinfocontrollergetinfo) | **GET** /api/databases/{id}/info | |

# **databaseInfoControllerGetDatabaseIndex**
> databaseInfoControllerGetDatabaseIndex()

Try to create connection to specified database index

### Example

```typescript
import {
    DatabaseInstancesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseInstancesApi(configuration);

let index: object; // (default to undefined)
let id: string; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseInfoControllerGetDatabaseIndex(
    index,
    id,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **index** | **object** |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseInfoControllerGetDatabaseOverview**
> DatabaseOverview databaseInfoControllerGetDatabaseOverview()

Get Redis database overview

### Example

```typescript
import {
    DatabaseInstancesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseInstancesApi(configuration);

let id: string; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)
let keyspace: 'full' | 'current'; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseInfoControllerGetDatabaseOverview(
    id,
    riDbIndex,
    keyspace
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|
| **keyspace** | [**&#39;full&#39; | &#39;current&#39;**]**Array<&#39;full&#39; &#124; &#39;current&#39;>** |  | (optional) defaults to undefined|


### Return type

**DatabaseOverview**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redis database overview |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseInfoControllerGetInfo**
> RedisDatabaseInfoResponse databaseInfoControllerGetInfo()

Get Redis database config info

### Example

```typescript
import {
    DatabaseInstancesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseInstancesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.databaseInfoControllerGetInfo(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RedisDatabaseInfoResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redis database info |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

