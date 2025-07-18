# CloudSubscriptionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cloudSubscriptionControllerGetPlans**](#cloudsubscriptioncontrollergetplans) | **GET** /api/cloud/me/subscription/plans | |

# **cloudSubscriptionControllerGetPlans**
> Array<CloudSubscriptionPlanResponse> cloudSubscriptionControllerGetPlans()

Get list of plans with cloud regions

### Example

```typescript
import {
    CloudSubscriptionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudSubscriptionApi(configuration);

let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudSubscriptionControllerGetPlans(
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

**Array<CloudSubscriptionPlanResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of plans with cloud regions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

