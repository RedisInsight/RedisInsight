# BrowserStringApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**stringControllerDownloadStringFile**](#stringcontrollerdownloadstringfile) | **POST** /api/databases/{dbInstance}/string/download-value | |
|[**stringControllerGetStringValue**](#stringcontrollergetstringvalue) | **POST** /api/databases/{dbInstance}/string/get-value | |
|[**stringControllerSetString**](#stringcontrollersetstring) | **POST** /api/databases/{dbInstance}/string | |
|[**stringControllerUpdateStringValue**](#stringcontrollerupdatestringvalue) | **PUT** /api/databases/{dbInstance}/string | |

# **stringControllerDownloadStringFile**
> stringControllerDownloadStringFile(getKeyInfoDto)

Endpoint do download string value

### Example

```typescript
import {
    BrowserStringApi,
    Configuration,
    GetKeyInfoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStringApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getKeyInfoDto: GetKeyInfoDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.stringControllerDownloadStringFile(
    dbInstance,
    encoding,
    getKeyInfoDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getKeyInfoDto** | **GetKeyInfoDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stringControllerGetStringValue**
> GetStringValueResponse stringControllerGetStringValue(getStringInfoDto)

Get string value

### Example

```typescript
import {
    BrowserStringApi,
    Configuration,
    GetStringInfoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStringApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getStringInfoDto: GetStringInfoDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.stringControllerGetStringValue(
    dbInstance,
    encoding,
    getStringInfoDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getStringInfoDto** | **GetStringInfoDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetStringValueResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | String value |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stringControllerSetString**
> stringControllerSetString(setStringWithExpireDto)

Set key to hold string value

### Example

```typescript
import {
    BrowserStringApi,
    Configuration,
    SetStringWithExpireDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStringApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let setStringWithExpireDto: SetStringWithExpireDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.stringControllerSetString(
    dbInstance,
    encoding,
    setStringWithExpireDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setStringWithExpireDto** | **SetStringWithExpireDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stringControllerUpdateStringValue**
> stringControllerUpdateStringValue(setStringDto)

Update string value

### Example

```typescript
import {
    BrowserStringApi,
    Configuration,
    SetStringDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStringApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let setStringDto: SetStringDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.stringControllerUpdateStringValue(
    dbInstance,
    encoding,
    setStringDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setStringDto** | **SetStringDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

