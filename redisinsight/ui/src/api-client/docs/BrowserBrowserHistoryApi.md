# BrowserBrowserHistoryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**browserHistoryControllerBulkDelete**](#browserhistorycontrollerbulkdelete) | **DELETE** /api/databases/{dbInstance}/history | |
|[**browserHistoryControllerDelete**](#browserhistorycontrollerdelete) | **DELETE** /api/databases/{dbInstance}/history/{id} | |
|[**browserHistoryControllerList**](#browserhistorycontrollerlist) | **GET** /api/databases/{dbInstance}/history | |

# **browserHistoryControllerBulkDelete**
> DeleteBrowserHistoryItemsResponse browserHistoryControllerBulkDelete(deleteBrowserHistoryItemsDto)

Delete bulk browser history items

### Example

```typescript
import {
    BrowserBrowserHistoryApi,
    Configuration,
    DeleteBrowserHistoryItemsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserBrowserHistoryApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let mode: string; //Search mode (default to undefined)
let deleteBrowserHistoryItemsDto: DeleteBrowserHistoryItemsDto; //

const { status, data } = await apiInstance.browserHistoryControllerBulkDelete(
    dbInstance,
    mode,
    deleteBrowserHistoryItemsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteBrowserHistoryItemsDto** | **DeleteBrowserHistoryItemsDto**|  | |
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **mode** | [**string**] | Search mode | defaults to undefined|


### Return type

**DeleteBrowserHistoryItemsResponse**

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

# **browserHistoryControllerDelete**
> browserHistoryControllerDelete()

Delete browser history item by id

### Example

```typescript
import {
    BrowserBrowserHistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserBrowserHistoryApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let mode: string; //Search mode (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.browserHistoryControllerDelete(
    dbInstance,
    mode,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **mode** | [**string**] | Search mode | defaults to undefined|
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

# **browserHistoryControllerList**
> BrowserHistory browserHistoryControllerList()

Get browser history

### Example

```typescript
import {
    BrowserBrowserHistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserBrowserHistoryApi(configuration);

let dbInstance: string; // (default to undefined)
let mode: 'pattern' | 'redisearch'; // (default to undefined)

const { status, data } = await apiInstance.browserHistoryControllerList(
    dbInstance,
    mode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **mode** | [**&#39;pattern&#39; | &#39;redisearch&#39;**]**Array<&#39;pattern&#39; &#124; &#39;redisearch&#39;>** |  | defaults to undefined|


### Return type

**BrowserHistory**

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

