# BrowserListApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listControllerCreateList**](#listcontrollercreatelist) | **POST** /api/databases/{dbInstance}/list | |
|[**listControllerDeleteElement**](#listcontrollerdeleteelement) | **DELETE** /api/databases/{dbInstance}/list/elements | |
|[**listControllerGetElement**](#listcontrollergetelement) | **POST** /api/databases/{dbInstance}/list/get-elements/{index} | |
|[**listControllerGetElements**](#listcontrollergetelements) | **POST** /api/databases/{dbInstance}/list/get-elements | |
|[**listControllerPushElement**](#listcontrollerpushelement) | **PUT** /api/databases/{dbInstance}/list | |
|[**listControllerUpdateElement**](#listcontrollerupdateelement) | **PATCH** /api/databases/{dbInstance}/list | |

# **listControllerCreateList**
> listControllerCreateList(createListWithExpireDto)

Set key to hold list data type

### Example

```typescript
import {
    BrowserListApi,
    Configuration,
    CreateListWithExpireDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserListApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let createListWithExpireDto: CreateListWithExpireDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listControllerCreateList(
    dbInstance,
    encoding,
    createListWithExpireDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createListWithExpireDto** | **CreateListWithExpireDto**|  | |
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

# **listControllerDeleteElement**
> DeleteListElementsResponse listControllerDeleteElement(deleteListElementsDto)

Remove and return the elements from the tail/head of list stored at key.

### Example

```typescript
import {
    BrowserListApi,
    Configuration,
    DeleteListElementsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserListApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let deleteListElementsDto: DeleteListElementsDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listControllerDeleteElement(
    dbInstance,
    encoding,
    deleteListElementsDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteListElementsDto** | **DeleteListElementsDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteListElementsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Removed elements. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listControllerGetElement**
> GetListElementResponse listControllerGetElement(keyDto)

Get specified List element by index

### Example

```typescript
import {
    BrowserListApi,
    Configuration,
    KeyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserListApi(configuration);

let index: number; //Zero-based index. 0 - first element, 1 - second element and so on. Negative indices can be used to designate elements starting at the tail of the list. Here, -1 means the last element (default to undefined)
let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let keyDto: KeyDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listControllerGetElement(
    index,
    dbInstance,
    encoding,
    keyDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **keyDto** | **KeyDto**|  | |
| **index** | [**number**] | Zero-based index. 0 - first element, 1 - second element and so on. Negative indices can be used to designate elements starting at the tail of the list. Here, -1 means the last element | defaults to undefined|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetListElementResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Specified elements of the list stored at key. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listControllerGetElements**
> GetListElementsResponse listControllerGetElements(getListElementsDto)

Get specified elements of the list stored at key

### Example

```typescript
import {
    BrowserListApi,
    Configuration,
    GetListElementsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserListApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getListElementsDto: GetListElementsDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listControllerGetElements(
    dbInstance,
    encoding,
    getListElementsDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getListElementsDto** | **GetListElementsDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetListElementsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Specified elements of the list stored at key. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listControllerPushElement**
> PushListElementsResponse listControllerPushElement(pushElementToListDto)

Insert element at the head/tail of the List data type

### Example

```typescript
import {
    BrowserListApi,
    Configuration,
    PushElementToListDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserListApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let pushElementToListDto: PushElementToListDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listControllerPushElement(
    dbInstance,
    encoding,
    pushElementToListDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pushElementToListDto** | **PushElementToListDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PushListElementsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Length of the list after the push operation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listControllerUpdateElement**
> SetListElementResponse listControllerUpdateElement(setListElementDto)

Update list element by index.

### Example

```typescript
import {
    BrowserListApi,
    Configuration,
    SetListElementDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserListApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let setListElementDto: SetListElementDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listControllerUpdateElement(
    dbInstance,
    encoding,
    setListElementDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setListElementDto** | **SetListElementDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**SetListElementResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated list element. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

