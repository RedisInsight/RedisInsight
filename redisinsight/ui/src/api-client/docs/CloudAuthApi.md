# CloudAuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cloudAuthControllerCallback**](#cloudauthcontrollercallback) | **GET** /api/cloud/auth/oauth/callback | |

# **cloudAuthControllerCallback**
> CloudAuthResponse cloudAuthControllerCallback()

OAuth callback endpoint for handling OAuth authorization code flow

### Example

```typescript
import {
    CloudAuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAuthApi(configuration);

let code: string; //Authorization code from OAuth provider (optional) (default to undefined)
let state: string; //State parameter to prevent CSRF attacks (optional) (default to undefined)
let error: string; //Error code if OAuth flow failed (optional) (default to undefined)
let errorDescription: string; //Human-readable error description (optional) (default to undefined)

const { status, data } = await apiInstance.cloudAuthControllerCallback(
    code,
    state,
    error,
    errorDescription
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] | Authorization code from OAuth provider | (optional) defaults to undefined|
| **state** | [**string**] | State parameter to prevent CSRF attacks | (optional) defaults to undefined|
| **error** | [**string**] | Error code if OAuth flow failed | (optional) defaults to undefined|
| **errorDescription** | [**string**] | Human-readable error description | (optional) defaults to undefined|


### Return type

**CloudAuthResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OAuth callback processed successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

