# CloudUserApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cloudUserControllerLogout**](#cloudusercontrollerlogout) | **GET** /api/cloud/me/logout | |
|[**cloudUserControllerMe**](#cloudusercontrollerme) | **GET** /api/cloud/me | |
|[**cloudUserControllerSetCurrentAccount**](#cloudusercontrollersetcurrentaccount) | **PUT** /api/cloud/me/accounts/{id}/current | |

# **cloudUserControllerLogout**
> cloudUserControllerLogout()

Logout user

### Example

```typescript
import {
    CloudUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUserApi(configuration);

const { status, data } = await apiInstance.cloudUserControllerLogout();
```

### Parameters
This endpoint does not have any parameters.


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

# **cloudUserControllerMe**
> CloudUser cloudUserControllerMe()

Return user general info with accounts list

### Example

```typescript
import {
    CloudUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUserApi(configuration);

let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudUserControllerMe(
    source,
    medium,
    campaign,
    amp,
    _package
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **source** | [**string**] |  | (optional) defaults to 'redisinsight'|
| **medium** | [**string**] |  | (optional) defaults to undefined|
| **campaign** | [**string**] |  | (optional) defaults to undefined|
| **amp** | [**string**] |  | (optional) defaults to undefined|
| **_package** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CloudUser**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cloudUserControllerSetCurrentAccount**
> CloudUser cloudUserControllerSetCurrentAccount()

Activate user account

### Example

```typescript
import {
    CloudUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudUserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.cloudUserControllerSetCurrentAccount(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CloudUser**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

