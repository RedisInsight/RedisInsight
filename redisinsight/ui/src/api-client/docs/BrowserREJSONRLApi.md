# BrowserREJSONRLApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**rejsonRlControllerArrAppend**](#rejsonrlcontrollerarrappend) | **PATCH** /api/databases/{dbInstance}/rejson-rl/arrappend | |
|[**rejsonRlControllerCreateJson**](#rejsonrlcontrollercreatejson) | **POST** /api/databases/{dbInstance}/rejson-rl | |
|[**rejsonRlControllerGetJson**](#rejsonrlcontrollergetjson) | **POST** /api/databases/{dbInstance}/rejson-rl/get | |
|[**rejsonRlControllerJsonSet**](#rejsonrlcontrollerjsonset) | **PATCH** /api/databases/{dbInstance}/rejson-rl/set | |
|[**rejsonRlControllerRemove**](#rejsonrlcontrollerremove) | **DELETE** /api/databases/{dbInstance}/rejson-rl | |

# **rejsonRlControllerArrAppend**
> rejsonRlControllerArrAppend(modifyRejsonRlArrAppendDto)

Append item inside REJSON-RL array

### Example

```typescript
import {
    BrowserREJSONRLApi,
    Configuration,
    ModifyRejsonRlArrAppendDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserREJSONRLApi(configuration);

let dbInstance: string; // (default to undefined)
let modifyRejsonRlArrAppendDto: ModifyRejsonRlArrAppendDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.rejsonRlControllerArrAppend(
    dbInstance,
    modifyRejsonRlArrAppendDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **modifyRejsonRlArrAppendDto** | **ModifyRejsonRlArrAppendDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
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

# **rejsonRlControllerCreateJson**
> rejsonRlControllerCreateJson(createRejsonRlWithExpireDto)

Create new REJSON-RL data type

### Example

```typescript
import {
    BrowserREJSONRLApi,
    Configuration,
    CreateRejsonRlWithExpireDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserREJSONRLApi(configuration);

let dbInstance: string; // (default to undefined)
let createRejsonRlWithExpireDto: CreateRejsonRlWithExpireDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.rejsonRlControllerCreateJson(
    dbInstance,
    createRejsonRlWithExpireDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createRejsonRlWithExpireDto** | **CreateRejsonRlWithExpireDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
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

# **rejsonRlControllerGetJson**
> GetRejsonRlResponseDto rejsonRlControllerGetJson(getRejsonRlDto)

Get json properties by path

### Example

```typescript
import {
    BrowserREJSONRLApi,
    Configuration,
    GetRejsonRlDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserREJSONRLApi(configuration);

let dbInstance: string; // (default to undefined)
let getRejsonRlDto: GetRejsonRlDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.rejsonRlControllerGetJson(
    dbInstance,
    getRejsonRlDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getRejsonRlDto** | **GetRejsonRlDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetRejsonRlResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Download full data by path or returns description of data inside |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rejsonRlControllerJsonSet**
> rejsonRlControllerJsonSet(modifyRejsonRlSetDto)

Modify REJSON-RL data type by path

### Example

```typescript
import {
    BrowserREJSONRLApi,
    Configuration,
    ModifyRejsonRlSetDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserREJSONRLApi(configuration);

let dbInstance: string; // (default to undefined)
let modifyRejsonRlSetDto: ModifyRejsonRlSetDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.rejsonRlControllerJsonSet(
    dbInstance,
    modifyRejsonRlSetDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **modifyRejsonRlSetDto** | **ModifyRejsonRlSetDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
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

# **rejsonRlControllerRemove**
> RemoveRejsonRlResponse rejsonRlControllerRemove(removeRejsonRlDto)

Removes path in the REJSON-RL

### Example

```typescript
import {
    BrowserREJSONRLApi,
    Configuration,
    RemoveRejsonRlDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserREJSONRLApi(configuration);

let dbInstance: string; // (default to undefined)
let removeRejsonRlDto: RemoveRejsonRlDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.rejsonRlControllerRemove(
    dbInstance,
    removeRejsonRlDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **removeRejsonRlDto** | **RemoveRejsonRlDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**RemoveRejsonRlResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Ok |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

