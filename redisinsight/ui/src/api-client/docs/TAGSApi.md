# TAGSApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**tagControllerCreate**](#tagcontrollercreate) | **POST** /api/tags | |
|[**tagControllerDelete**](#tagcontrollerdelete) | **DELETE** /api/tags/{id} | |
|[**tagControllerGet**](#tagcontrollerget) | **GET** /api/tags/{id} | |
|[**tagControllerList**](#tagcontrollerlist) | **GET** /api/tags | |
|[**tagControllerUpdate**](#tagcontrollerupdate) | **PATCH** /api/tags/{id} | |

# **tagControllerCreate**
> Tag tagControllerCreate(createTagDto)

Create tag

### Example

```typescript
import {
    TAGSApi,
    Configuration,
    CreateTagDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TAGSApi(configuration);

let createTagDto: CreateTagDto; //

const { status, data } = await apiInstance.tagControllerCreate(
    createTagDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTagDto** | **CreateTagDto**|  | |


### Return type

**Tag**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tagControllerDelete**
> tagControllerDelete()

Delete tag

### Example

```typescript
import {
    TAGSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TAGSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.tagControllerDelete(
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

# **tagControllerGet**
> Tag tagControllerGet()

Get tag by id

### Example

```typescript
import {
    TAGSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TAGSApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.tagControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Tag**

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

# **tagControllerList**
> Array<Tag> tagControllerList()

Get tags list

### Example

```typescript
import {
    TAGSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TAGSApi(configuration);

const { status, data } = await apiInstance.tagControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Tag>**

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

# **tagControllerUpdate**
> Tag tagControllerUpdate(updateTagDto)

Update tag

### Example

```typescript
import {
    TAGSApi,
    Configuration,
    UpdateTagDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TAGSApi(configuration);

let id: string; // (default to undefined)
let updateTagDto: UpdateTagDto; //

const { status, data } = await apiInstance.tagControllerUpdate(
    id,
    updateTagDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateTagDto** | **UpdateTagDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Tag**

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

