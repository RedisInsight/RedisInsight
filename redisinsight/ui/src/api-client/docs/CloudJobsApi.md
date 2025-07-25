# CloudJobsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cloudJobControllerCreateFreeDatabase**](#cloudjobcontrollercreatefreedatabase) | **POST** /api/cloud/me/jobs | |
|[**cloudJobControllerGetJobInfo**](#cloudjobcontrollergetjobinfo) | **GET** /api/cloud/me/jobs/{id} | |
|[**cloudJobControllerGetUserJobsInfo**](#cloudjobcontrollergetuserjobsinfo) | **GET** /api/cloud/me/jobs | |

# **cloudJobControllerCreateFreeDatabase**
> CloudJobInfo cloudJobControllerCreateFreeDatabase(createCloudJobDto)

Create cloud job

### Example

```typescript
import {
    CloudJobsApi,
    Configuration,
    CreateCloudJobDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudJobsApi(configuration);

let createCloudJobDto: CreateCloudJobDto; //
let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudJobControllerCreateFreeDatabase(
    createCloudJobDto,
    source,
    medium,
    campaign,
    amp,
    _package
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCloudJobDto** | **CreateCloudJobDto**|  | |
| **source** | [**string**] |  | (optional) defaults to 'redisinsight'|
| **medium** | [**string**] |  | (optional) defaults to undefined|
| **campaign** | [**string**] |  | (optional) defaults to undefined|
| **amp** | [**string**] |  | (optional) defaults to undefined|
| **_package** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CloudJobInfo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cloudJobControllerGetJobInfo**
> CloudJobInfo cloudJobControllerGetJobInfo()

Get user jobs

### Example

```typescript
import {
    CloudJobsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudJobsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.cloudJobControllerGetJobInfo(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CloudJobInfo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cloudJobControllerGetUserJobsInfo**
> Array<CloudJobInfo> cloudJobControllerGetUserJobsInfo()

Get list of user jobs

### Example

```typescript
import {
    CloudJobsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudJobsApi(configuration);

const { status, data } = await apiInstance.cloudJobControllerGetUserJobsInfo();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CloudJobInfo>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

