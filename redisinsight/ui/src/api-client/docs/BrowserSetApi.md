# BrowserSetApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**setControllerAddMembers**](#setcontrolleraddmembers) | **PUT** /api/databases/{dbInstance}/set | |
|[**setControllerCreateSet**](#setcontrollercreateset) | **POST** /api/databases/{dbInstance}/set | |
|[**setControllerDeleteMembers**](#setcontrollerdeletemembers) | **DELETE** /api/databases/{dbInstance}/set/members | |
|[**setControllerGetMembers**](#setcontrollergetmembers) | **POST** /api/databases/{dbInstance}/set/get-members | |

# **setControllerAddMembers**
> setControllerAddMembers(addMembersToSetDto)

Add the specified members to the Set stored at key

### Example

```typescript
import {
    BrowserSetApi,
    Configuration,
    AddMembersToSetDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let addMembersToSetDto: AddMembersToSetDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setControllerAddMembers(
    dbInstance,
    encoding,
    addMembersToSetDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addMembersToSetDto** | **AddMembersToSetDto**|  | |
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
|**200** | Members added to set successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setControllerCreateSet**
> setControllerCreateSet(createSetWithExpireDto)

Set key to hold Set data type

### Example

```typescript
import {
    BrowserSetApi,
    Configuration,
    CreateSetWithExpireDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let createSetWithExpireDto: CreateSetWithExpireDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setControllerCreateSet(
    dbInstance,
    encoding,
    createSetWithExpireDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSetWithExpireDto** | **CreateSetWithExpireDto**|  | |
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
|**200** | Set key created successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setControllerDeleteMembers**
> DeleteMembersFromSetResponse setControllerDeleteMembers(deleteMembersFromSetDto)

Remove the specified members from the Set stored at key

### Example

```typescript
import {
    BrowserSetApi,
    Configuration,
    DeleteMembersFromSetDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let deleteMembersFromSetDto: DeleteMembersFromSetDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setControllerDeleteMembers(
    dbInstance,
    encoding,
    deleteMembersFromSetDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteMembersFromSetDto** | **DeleteMembersFromSetDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteMembersFromSetResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Members removed from set |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setControllerGetMembers**
> GetSetMembersResponse setControllerGetMembers(getSetMembersDto)

Get specified members of the set stored at key by cursor position

### Example

```typescript
import {
    BrowserSetApi,
    Configuration,
    GetSetMembersDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getSetMembersDto: GetSetMembersDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setControllerGetMembers(
    dbInstance,
    encoding,
    getSetMembersDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getSetMembersDto** | **GetSetMembersDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetSetMembersResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Specified members of the set stored at key. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

