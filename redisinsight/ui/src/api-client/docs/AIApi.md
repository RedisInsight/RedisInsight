# AIApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**aiChatControllerCreate**](#aichatcontrollercreate) | **POST** /api/ai/assistant/chats | |
|[**aiChatControllerDelete**](#aichatcontrollerdelete) | **DELETE** /api/ai/assistant/chats/{id} | |
|[**aiChatControllerGetHistory**](#aichatcontrollergethistory) | **GET** /api/ai/assistant/chats/{id} | |
|[**aiChatControllerPostMessage**](#aichatcontrollerpostmessage) | **POST** /api/ai/assistant/chats/{id}/messages | |
|[**aiQueryControllerClearHistory**](#aiquerycontrollerclearhistory) | **DELETE** /api/ai/expert/{id}/messages | |
|[**aiQueryControllerGetHistory**](#aiquerycontrollergethistory) | **GET** /api/ai/expert/{id}/messages | |
|[**aiQueryControllerStreamQuestion**](#aiquerycontrollerstreamquestion) | **POST** /api/ai/expert/{id}/messages | |

# **aiChatControllerCreate**
> PickTypeClass aiChatControllerCreate()

Create a new chat

### Example

```typescript
import {
    AIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

const { status, data } = await apiInstance.aiChatControllerCreate();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PickTypeClass**

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

# **aiChatControllerDelete**
> aiChatControllerDelete()

Reset chat

### Example

```typescript
import {
    AIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.aiChatControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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

# **aiChatControllerGetHistory**
> AiChat aiChatControllerGetHistory()

Get chat history

### Example

```typescript
import {
    AIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.aiChatControllerGetHistory(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AiChat**

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

# **aiChatControllerPostMessage**
> string aiChatControllerPostMessage(sendAiChatMessageDto)

Post a message

### Example

```typescript
import {
    AIApi,
    Configuration,
    SendAiChatMessageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

let id: string; // (default to undefined)
let sendAiChatMessageDto: SendAiChatMessageDto; //

const { status, data } = await apiInstance.aiChatControllerPostMessage(
    id,
    sendAiChatMessageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendAiChatMessageDto** | **SendAiChatMessageDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aiQueryControllerClearHistory**
> string aiQueryControllerClearHistory()

Generate new query

### Example

```typescript
import {
    AIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.aiQueryControllerClearHistory(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**string**

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

# **aiQueryControllerGetHistory**
> string aiQueryControllerGetHistory()

Generate new query

### Example

```typescript
import {
    AIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.aiQueryControllerGetHistory(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**string**

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

# **aiQueryControllerStreamQuestion**
> string aiQueryControllerStreamQuestion(sendAiQueryMessageDto)

Generate new query

### Example

```typescript
import {
    AIApi,
    Configuration,
    SendAiQueryMessageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIApi(configuration);

let id: string; // (default to undefined)
let sendAiQueryMessageDto: SendAiQueryMessageDto; //

const { status, data } = await apiInstance.aiQueryControllerStreamQuestion(
    id,
    sendAiQueryMessageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendAiQueryMessageDto** | **SendAiQueryMessageDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

