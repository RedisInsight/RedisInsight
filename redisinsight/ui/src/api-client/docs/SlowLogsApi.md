# SlowLogsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**slowLogControllerGetConfig**](#slowlogcontrollergetconfig) | **GET** /api/databases/{dbInstance}/slow-logs/config | |
|[**slowLogControllerGetSlowLogs**](#slowlogcontrollergetslowlogs) | **GET** /api/databases/{dbInstance}/slow-logs | |
|[**slowLogControllerResetSlowLogs**](#slowlogcontrollerresetslowlogs) | **DELETE** /api/databases/{dbInstance}/slow-logs | |
|[**slowLogControllerUpdateConfig**](#slowlogcontrollerupdateconfig) | **PATCH** /api/databases/{dbInstance}/slow-logs/config | |

# **slowLogControllerGetConfig**
> SlowLogConfig slowLogControllerGetConfig()

Get slowlog config

### Example

```typescript
import {
    SlowLogsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlowLogsApi(configuration);

let dbInstance: string; // (default to undefined)

const { status, data } = await apiInstance.slowLogControllerGetConfig(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|


### Return type

**SlowLogConfig**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **slowLogControllerGetSlowLogs**
> Array<SlowLog> slowLogControllerGetSlowLogs()

List of slow logs

### Example

```typescript
import {
    SlowLogsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlowLogsApi(configuration);

let dbInstance: string; // (default to undefined)
let count: number; //Specifying the number of slow logs to fetch per node. (optional) (default to 50)

const { status, data } = await apiInstance.slowLogControllerGetSlowLogs(
    dbInstance,
    count
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **count** | [**number**] | Specifying the number of slow logs to fetch per node. | (optional) defaults to 50|


### Return type

**Array<SlowLog>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **slowLogControllerResetSlowLogs**
> slowLogControllerResetSlowLogs()

Clear slow logs

### Example

```typescript
import {
    SlowLogsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SlowLogsApi(configuration);

let dbInstance: string; // (default to undefined)

const { status, data } = await apiInstance.slowLogControllerResetSlowLogs(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|


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

# **slowLogControllerUpdateConfig**
> SlowLogConfig slowLogControllerUpdateConfig(updateSlowLogConfigDto)

Update slowlog config

### Example

```typescript
import {
    SlowLogsApi,
    Configuration,
    UpdateSlowLogConfigDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SlowLogsApi(configuration);

let dbInstance: string; // (default to undefined)
let updateSlowLogConfigDto: UpdateSlowLogConfigDto; //

const { status, data } = await apiInstance.slowLogControllerUpdateConfig(
    dbInstance,
    updateSlowLogConfigDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSlowLogConfigDto** | **UpdateSlowLogConfigDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|


### Return type

**SlowLogConfig**

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

