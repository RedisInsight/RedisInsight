# BrowserHashApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**hashControllerAddMember**](#hashcontrolleraddmember) | **PUT** /api/databases/{dbInstance}/hash | |
|[**hashControllerCreateHash**](#hashcontrollercreatehash) | **POST** /api/databases/{dbInstance}/hash | |
|[**hashControllerDeleteFields**](#hashcontrollerdeletefields) | **DELETE** /api/databases/{dbInstance}/hash/fields | |
|[**hashControllerGetMembers**](#hashcontrollergetmembers) | **POST** /api/databases/{dbInstance}/hash/get-fields | |
|[**hashControllerUpdateTtl**](#hashcontrollerupdatettl) | **PATCH** /api/databases/{dbInstance}/hash/ttl | |

# **hashControllerAddMember**
> hashControllerAddMember(addFieldsToHashDto)

Add the specified fields to the Hash stored at key

### Example

```typescript
import {
    BrowserHashApi,
    Configuration,
    AddFieldsToHashDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserHashApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let addFieldsToHashDto: AddFieldsToHashDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.hashControllerAddMember(
    dbInstance,
    encoding,
    addFieldsToHashDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addFieldsToHashDto** | **AddFieldsToHashDto**|  | |
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
|**200** | Fields added to hash successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hashControllerCreateHash**
> hashControllerCreateHash(createHashWithExpireDto)

Set key to hold Hash data type

### Example

```typescript
import {
    BrowserHashApi,
    Configuration,
    CreateHashWithExpireDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserHashApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let createHashWithExpireDto: CreateHashWithExpireDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.hashControllerCreateHash(
    dbInstance,
    encoding,
    createHashWithExpireDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createHashWithExpireDto** | **CreateHashWithExpireDto**|  | |
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
|**200** | Hash key created successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hashControllerDeleteFields**
> DeleteFieldsFromHashResponse hashControllerDeleteFields(deleteFieldsFromHashDto)

Remove the specified fields from the Hash stored at key

### Example

```typescript
import {
    BrowserHashApi,
    Configuration,
    DeleteFieldsFromHashDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserHashApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let deleteFieldsFromHashDto: DeleteFieldsFromHashDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.hashControllerDeleteFields(
    dbInstance,
    encoding,
    deleteFieldsFromHashDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteFieldsFromHashDto** | **DeleteFieldsFromHashDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteFieldsFromHashResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Fields removed from hash |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hashControllerGetMembers**
> GetHashFieldsResponse hashControllerGetMembers(getHashFieldsDto)

Get specified fields of the hash stored at key by cursor position

### Example

```typescript
import {
    BrowserHashApi,
    Configuration,
    GetHashFieldsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserHashApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getHashFieldsDto: GetHashFieldsDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.hashControllerGetMembers(
    dbInstance,
    encoding,
    getHashFieldsDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getHashFieldsDto** | **GetHashFieldsDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetHashFieldsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Specified fields of the hash stored at key. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hashControllerUpdateTtl**
> hashControllerUpdateTtl(updateHashFieldsTtlDto)

Update hash fields ttl

### Example

```typescript
import {
    BrowserHashApi,
    Configuration,
    UpdateHashFieldsTtlDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserHashApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let updateHashFieldsTtlDto: UpdateHashFieldsTtlDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.hashControllerUpdateTtl(
    dbInstance,
    encoding,
    updateHashFieldsTtlDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateHashFieldsTtlDto** | **UpdateHashFieldsTtlDto**|  | |
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
|**200** | Hash fields TTL updated successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

