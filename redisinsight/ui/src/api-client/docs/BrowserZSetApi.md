# BrowserZSetApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**zSetControllerAddMembers**](#zsetcontrolleraddmembers) | **PUT** /api/databases/{dbInstance}/zSet | |
|[**zSetControllerCreateSet**](#zsetcontrollercreateset) | **POST** /api/databases/{dbInstance}/zSet | |
|[**zSetControllerDeleteMembers**](#zsetcontrollerdeletemembers) | **DELETE** /api/databases/{dbInstance}/zSet/members | |
|[**zSetControllerGetZSet**](#zsetcontrollergetzset) | **POST** /api/databases/{dbInstance}/zSet/get-members | |
|[**zSetControllerSearchZSet**](#zsetcontrollersearchzset) | **POST** /api/databases/{dbInstance}/zSet/search | |
|[**zSetControllerUpdateMember**](#zsetcontrollerupdatemember) | **PATCH** /api/databases/{dbInstance}/zSet | |

# **zSetControllerAddMembers**
> zSetControllerAddMembers(addMembersToZSetDto)

Add the specified members to the ZSet stored at key

### Example

```typescript
import {
    BrowserZSetApi,
    Configuration,
    AddMembersToZSetDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserZSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let addMembersToZSetDto: AddMembersToZSetDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.zSetControllerAddMembers(
    dbInstance,
    encoding,
    addMembersToZSetDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addMembersToZSetDto** | **AddMembersToZSetDto**|  | |
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

# **zSetControllerCreateSet**
> zSetControllerCreateSet(createZSetWithExpireDto)

Set key to hold ZSet data type

### Example

```typescript
import {
    BrowserZSetApi,
    Configuration,
    CreateZSetWithExpireDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserZSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let createZSetWithExpireDto: CreateZSetWithExpireDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.zSetControllerCreateSet(
    dbInstance,
    encoding,
    createZSetWithExpireDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createZSetWithExpireDto** | **CreateZSetWithExpireDto**|  | |
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

# **zSetControllerDeleteMembers**
> DeleteMembersFromZSetResponse zSetControllerDeleteMembers(deleteMembersFromZSetDto)

Remove the specified members from the Set stored at key

### Example

```typescript
import {
    BrowserZSetApi,
    Configuration,
    DeleteMembersFromZSetDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserZSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let deleteMembersFromZSetDto: DeleteMembersFromZSetDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.zSetControllerDeleteMembers(
    dbInstance,
    encoding,
    deleteMembersFromZSetDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteMembersFromZSetDto** | **DeleteMembersFromZSetDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteMembersFromZSetResponse**

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

# **zSetControllerGetZSet**
> GetZSetResponse zSetControllerGetZSet(getZSetMembersDto)

Get specified members of the ZSet stored at key

### Example

```typescript
import {
    BrowserZSetApi,
    Configuration,
    GetZSetMembersDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserZSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getZSetMembersDto: GetZSetMembersDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.zSetControllerGetZSet(
    dbInstance,
    encoding,
    getZSetMembersDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getZSetMembersDto** | **GetZSetMembersDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetZSetResponse**

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

# **zSetControllerSearchZSet**
> SearchZSetMembersResponse zSetControllerSearchZSet(searchZSetMembersDto)

Search members in ZSet stored at key

### Example

```typescript
import {
    BrowserZSetApi,
    Configuration,
    SearchZSetMembersDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserZSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let searchZSetMembersDto: SearchZSetMembersDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.zSetControllerSearchZSet(
    dbInstance,
    encoding,
    searchZSetMembersDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **searchZSetMembersDto** | **SearchZSetMembersDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**SearchZSetMembersResponse**

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

# **zSetControllerUpdateMember**
> zSetControllerUpdateMember(updateMemberInZSetDto)

Update the specified member in the ZSet stored at key

### Example

```typescript
import {
    BrowserZSetApi,
    Configuration,
    UpdateMemberInZSetDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserZSetApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let updateMemberInZSetDto: UpdateMemberInZSetDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.zSetControllerUpdateMember(
    dbInstance,
    encoding,
    updateMemberInZSetDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateMemberInZSetDto** | **UpdateMemberInZSetDto**|  | |
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

