# CloudCAPIKeysApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cloudCapiKeyControllerDelete**](#cloudcapikeycontrollerdelete) | **DELETE** /api/cloud/me/capi-keys/{id} | |
|[**cloudCapiKeyControllerDeleteAll**](#cloudcapikeycontrollerdeleteall) | **DELETE** /api/cloud/me/capi-keys | |
|[**cloudCapiKeyControllerList**](#cloudcapikeycontrollerlist) | **GET** /api/cloud/me/capi-keys | |

# **cloudCapiKeyControllerDelete**
> cloudCapiKeyControllerDelete()

Removes user\'s capi keys by id

### Example

```typescript
import {
    CloudCAPIKeysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudCAPIKeysApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.cloudCapiKeyControllerDelete(
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

# **cloudCapiKeyControllerDeleteAll**
> cloudCapiKeyControllerDeleteAll()

Removes all user\'s capi keys

### Example

```typescript
import {
    CloudCAPIKeysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudCAPIKeysApi(configuration);

const { status, data } = await apiInstance.cloudCapiKeyControllerDeleteAll();
```

### Parameters
This endpoint does not have any parameters.


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

# **cloudCapiKeyControllerList**
> Array<CloudCapiKey> cloudCapiKeyControllerList()

Return list of user\'s existing capi keys

### Example

```typescript
import {
    CloudCAPIKeysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudCAPIKeysApi(configuration);

const { status, data } = await apiInstance.cloudCapiKeyControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CloudCapiKey>**

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

