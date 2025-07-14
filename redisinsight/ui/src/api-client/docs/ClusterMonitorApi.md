# ClusterMonitorApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**clusterMonitorControllerGetClusterDetails**](#clustermonitorcontrollergetclusterdetails) | **GET** /api/databases/{dbInstance}/cluster-details | |

# **clusterMonitorControllerGetClusterDetails**
> ClusterDetails clusterMonitorControllerGetClusterDetails()

Get cluster details

### Example

```typescript
import {
    ClusterMonitorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ClusterMonitorApi(configuration);

let dbInstance: string; // (default to undefined)

const { status, data } = await apiInstance.clusterMonitorControllerGetClusterDetails(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|


### Return type

**ClusterDetails**

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

