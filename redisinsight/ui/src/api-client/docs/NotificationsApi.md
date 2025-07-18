# NotificationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**notificationControllerGetNotifications**](#notificationcontrollergetnotifications) | **GET** /api/notifications | |
|[**notificationControllerReadNotifications**](#notificationcontrollerreadnotifications) | **PATCH** /api/notifications/read | |

# **notificationControllerGetNotifications**
> NotificationsDto notificationControllerGetNotifications()

Return ordered notifications history

### Example

```typescript
import {
    NotificationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

const { status, data } = await apiInstance.notificationControllerGetNotifications();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**NotificationsDto**

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

# **notificationControllerReadNotifications**
> NotificationsDto notificationControllerReadNotifications(readNotificationsDto)

Mark all notifications as read

### Example

```typescript
import {
    NotificationsApi,
    Configuration,
    ReadNotificationsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let readNotificationsDto: ReadNotificationsDto; //

const { status, data } = await apiInstance.notificationControllerReadNotifications(
    readNotificationsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **readNotificationsDto** | **ReadNotificationsDto**|  | |


### Return type

**NotificationsDto**

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

