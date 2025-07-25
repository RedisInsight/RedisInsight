# CLIApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cliControllerDeleteClient**](#clicontrollerdeleteclient) | **DELETE** /api/databases/{dbInstance}/cli/{uuid} | |
|[**cliControllerGetClient**](#clicontrollergetclient) | **POST** /api/databases/{dbInstance}/cli | |
|[**cliControllerReCreateClient**](#clicontrollerrecreateclient) | **PATCH** /api/databases/{dbInstance}/cli/{uuid} | |
|[**cliControllerSendClusterCommand**](#clicontrollersendclustercommand) | **POST** /api/databases/{dbInstance}/cli/{uuid}/send-cluster-command | |
|[**cliControllerSendCommand**](#clicontrollersendcommand) | **POST** /api/databases/{dbInstance}/cli/{uuid}/send-command | |

# **cliControllerDeleteClient**
> DeleteClientResponse cliControllerDeleteClient()

Delete Redis CLI client

### Example

```typescript
import {
    CLIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CLIApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let uuid: string; //CLI client uuid (default to undefined)

const { status, data } = await apiInstance.cliControllerDeleteClient(
    dbInstance,
    uuid
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **uuid** | [**string**] | CLI client uuid | defaults to undefined|


### Return type

**DeleteClientResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete Redis CLI client response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cliControllerGetClient**
> CreateCliClientResponse cliControllerGetClient()

Create Redis client for CLI

### Example

```typescript
import {
    CLIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CLIApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)

const { status, data } = await apiInstance.cliControllerGetClient(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


### Return type

**CreateCliClientResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Create Redis client for CLI |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cliControllerReCreateClient**
> cliControllerReCreateClient()

Re-create Redis client for CLI

### Example

```typescript
import {
    CLIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CLIApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let uuid: string; //CLI client uuid (default to undefined)

const { status, data } = await apiInstance.cliControllerReCreateClient(
    dbInstance,
    uuid
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **uuid** | [**string**] | CLI client uuid | defaults to undefined|


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

# **cliControllerSendClusterCommand**
> Array<SendCommandResponse> cliControllerSendClusterCommand(sendCommandDto)

Send Redis CLI command

### Example

```typescript
import {
    CLIApi,
    Configuration,
    SendCommandDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CLIApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let uuid: string; //CLI client uuid (default to undefined)
let sendCommandDto: SendCommandDto; //

const { status, data } = await apiInstance.cliControllerSendClusterCommand(
    dbInstance,
    uuid,
    sendCommandDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendCommandDto** | **SendCommandDto**|  | |
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **uuid** | [**string**] | CLI client uuid | defaults to undefined|


### Return type

**Array<SendCommandResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redis CLI command response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cliControllerSendCommand**
> SendCommandResponse cliControllerSendCommand(sendCommandDto)

Send Redis CLI command

### Example

```typescript
import {
    CLIApi,
    Configuration,
    SendCommandDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CLIApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let uuid: string; //CLI client uuid (default to undefined)
let sendCommandDto: SendCommandDto; //

const { status, data } = await apiInstance.cliControllerSendCommand(
    dbInstance,
    uuid,
    sendCommandDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendCommandDto** | **SendCommandDto**|  | |
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **uuid** | [**string**] | CLI client uuid | defaults to undefined|


### Return type

**SendCommandResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redis CLI command response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

