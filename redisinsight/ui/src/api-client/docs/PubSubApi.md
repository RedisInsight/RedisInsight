# PubSubApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**pubSubControllerPublish**](#pubsubcontrollerpublish) | **POST** /api/databases/{dbInstance}/pub-sub/messages | |

# **pubSubControllerPublish**
> PublishResponse pubSubControllerPublish(publishDto)

Publish message to a channel

### Example

```typescript
import {
    PubSubApi,
    Configuration,
    PublishDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PubSubApi(configuration);

let dbInstance: string; // (default to undefined)
let publishDto: PublishDto; //

const { status, data } = await apiInstance.pubSubControllerPublish(
    dbInstance,
    publishDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **publishDto** | **PublishDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|


### Return type

**PublishResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Returns number of clients message ws delivered |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

