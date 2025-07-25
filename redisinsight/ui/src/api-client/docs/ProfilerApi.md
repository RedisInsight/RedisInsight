# ProfilerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**profilerControllerDownloadLogsFile**](#profilercontrollerdownloadlogsfile) | **GET** /api/profiler/logs/{id} | |

# **profilerControllerDownloadLogsFile**
> profilerControllerDownloadLogsFile()

Endpoint do download profiler log file

### Example

```typescript
import {
    ProfilerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProfilerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.profilerControllerDownloadLogsFile(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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

