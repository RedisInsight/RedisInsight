# BrowserKeysApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**keysControllerDeleteKey**](#keyscontrollerdeletekey) | **DELETE** /api/databases/{dbInstance}/keys | |
|[**keysControllerGetKeyInfo**](#keyscontrollergetkeyinfo) | **POST** /api/databases/{dbInstance}/keys/get-info | |
|[**keysControllerGetKeys**](#keyscontrollergetkeys) | **POST** /api/databases/{dbInstance}/keys | |
|[**keysControllerGetKeysInfo**](#keyscontrollergetkeysinfo) | **POST** /api/databases/{dbInstance}/keys/get-metadata | |
|[**keysControllerRenameKey**](#keyscontrollerrenamekey) | **PATCH** /api/databases/{dbInstance}/keys/name | |
|[**keysControllerUpdateTtl**](#keyscontrollerupdatettl) | **PATCH** /api/databases/{dbInstance}/keys/ttl | |

# **keysControllerDeleteKey**
> DeleteKeysResponse keysControllerDeleteKey(deleteKeysDto)

Delete key

### Example

```typescript
import {
    BrowserKeysApi,
    Configuration,
    DeleteKeysDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserKeysApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let deleteKeysDto: DeleteKeysDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.keysControllerDeleteKey(
    dbInstance,
    encoding,
    deleteKeysDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteKeysDto** | **DeleteKeysDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteKeysResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Number of affected keys. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **keysControllerGetKeyInfo**
> GetKeyInfoResponse keysControllerGetKeyInfo(getKeyInfoDto)

Get key info

### Example

```typescript
import {
    BrowserKeysApi,
    Configuration,
    GetKeyInfoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserKeysApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getKeyInfoDto: GetKeyInfoDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.keysControllerGetKeyInfo(
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

**GetKeyInfoResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Keys info |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **keysControllerGetKeys**
> Array<GetKeysWithDetailsResponse> keysControllerGetKeys(getKeysDto)

Get keys by cursor position

### Example

```typescript
import {
    BrowserKeysApi,
    Configuration,
    GetKeysDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserKeysApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getKeysDto: GetKeysDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.keysControllerGetKeys(
    dbInstance,
    encoding,
    getKeysDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getKeysDto** | **GetKeysDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<GetKeysWithDetailsResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Keys list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **keysControllerGetKeysInfo**
> Array<GetKeyInfoResponse> keysControllerGetKeysInfo(getKeysInfoDto)

Get info for multiple keys

### Example

```typescript
import {
    BrowserKeysApi,
    Configuration,
    GetKeysInfoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserKeysApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getKeysInfoDto: GetKeysInfoDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.keysControllerGetKeysInfo(
    dbInstance,
    encoding,
    getKeysInfoDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getKeysInfoDto** | **GetKeysInfoDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<GetKeyInfoResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Info for multiple keys |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **keysControllerRenameKey**
> RenameKeyResponse keysControllerRenameKey(renameKeyDto)

Rename key

### Example

```typescript
import {
    BrowserKeysApi,
    Configuration,
    RenameKeyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserKeysApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let renameKeyDto: RenameKeyDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.keysControllerRenameKey(
    dbInstance,
    encoding,
    renameKeyDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **renameKeyDto** | **RenameKeyDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**RenameKeyResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | New key name. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **keysControllerUpdateTtl**
> KeyTtlResponse keysControllerUpdateTtl(updateKeyTtlDto)

Update the remaining time to live of a key

### Example

```typescript
import {
    BrowserKeysApi,
    Configuration,
    UpdateKeyTtlDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserKeysApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let updateKeyTtlDto: UpdateKeyTtlDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.keysControllerUpdateTtl(
    dbInstance,
    encoding,
    updateKeyTtlDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateKeyTtlDto** | **UpdateKeyTtlDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**KeyTtlResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | The remaining time to live of a key. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

