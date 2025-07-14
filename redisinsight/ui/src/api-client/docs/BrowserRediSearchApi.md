# BrowserRediSearchApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**redisearchControllerCreateIndex**](#redisearchcontrollercreateindex) | **POST** /api/databases/{dbInstance}/redisearch | |
|[**redisearchControllerInfo**](#redisearchcontrollerinfo) | **POST** /api/databases/{dbInstance}/redisearch/info | |
|[**redisearchControllerList**](#redisearchcontrollerlist) | **GET** /api/databases/{dbInstance}/redisearch | |
|[**redisearchControllerSearch**](#redisearchcontrollersearch) | **POST** /api/databases/{dbInstance}/redisearch/search | |

# **redisearchControllerCreateIndex**
> redisearchControllerCreateIndex(createRedisearchIndexDto)

Create redisearch index

### Example

```typescript
import {
    BrowserRediSearchApi,
    Configuration,
    CreateRedisearchIndexDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserRediSearchApi(configuration);

let dbInstance: string; // (default to undefined)
let createRedisearchIndexDto: CreateRedisearchIndexDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.redisearchControllerCreateIndex(
    dbInstance,
    createRedisearchIndexDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createRedisearchIndexDto** | **CreateRedisearchIndexDto**|  | |
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

# **redisearchControllerInfo**
> IndexInfoDto redisearchControllerInfo(indexInfoRequestBodyDto)

Get index info

### Example

```typescript
import {
    BrowserRediSearchApi,
    Configuration,
    IndexInfoRequestBodyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserRediSearchApi(configuration);

let dbInstance: string; // (default to undefined)
let indexInfoRequestBodyDto: IndexInfoRequestBodyDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.redisearchControllerInfo(
    dbInstance,
    indexInfoRequestBodyDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **indexInfoRequestBodyDto** | **IndexInfoRequestBodyDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**IndexInfoDto**

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

# **redisearchControllerList**
> ListRedisearchIndexesResponse redisearchControllerList()

Get list of available indexes

### Example

```typescript
import {
    BrowserRediSearchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserRediSearchApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.redisearchControllerList(
    dbInstance,
    encoding,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**ListRedisearchIndexesResponse**

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

# **redisearchControllerSearch**
> GetKeysWithDetailsResponse redisearchControllerSearch(searchRedisearchDto)

Search for keys in index

### Example

```typescript
import {
    BrowserRediSearchApi,
    Configuration,
    SearchRedisearchDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserRediSearchApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let searchRedisearchDto: SearchRedisearchDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.redisearchControllerSearch(
    dbInstance,
    encoding,
    searchRedisearchDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **searchRedisearchDto** | **SearchRedisearchDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetKeysWithDetailsResponse**

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

