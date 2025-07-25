# AnalyticsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**analyticsControllerSendEvent**](#analyticscontrollersendevent) | **POST** /api/analytics/send-event | |
|[**analyticsControllerSendPage**](#analyticscontrollersendpage) | **POST** /api/analytics/send-page | |

# **analyticsControllerSendEvent**
> analyticsControllerSendEvent(sendEventDto)

Send telemetry event

### Example

```typescript
import {
    AnalyticsApi,
    Configuration,
    SendEventDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let sendEventDto: SendEventDto; //

const { status, data } = await apiInstance.analyticsControllerSendEvent(
    sendEventDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendEventDto** | **SendEventDto**|  | |


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
|**204** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **analyticsControllerSendPage**
> analyticsControllerSendPage(sendEventDto)

Send telemetry page

### Example

```typescript
import {
    AnalyticsApi,
    Configuration,
    SendEventDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AnalyticsApi(configuration);

let sendEventDto: SendEventDto; //

const { status, data } = await apiInstance.analyticsControllerSendPage(
    sendEventDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendEventDto** | **SendEventDto**|  | |


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
|**204** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

