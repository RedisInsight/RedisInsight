# PluginsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**pluginControllerGetAll**](#plugincontrollergetall) | **GET** /api/plugins | |
|[**pluginsControllerGetPluginCommands**](#pluginscontrollergetplugincommands) | **GET** /api/databases/{dbInstance}/plugins/commands | |
|[**pluginsControllerGetState**](#pluginscontrollergetstate) | **GET** /api/databases/{dbInstance}/plugins/{visualizationId}/command-executions/{id}/state | |
|[**pluginsControllerSaveState**](#pluginscontrollersavestate) | **POST** /api/databases/{dbInstance}/plugins/{visualizationId}/command-executions/{id}/state | |
|[**pluginsControllerSendCommand**](#pluginscontrollersendcommand) | **POST** /api/databases/{dbInstance}/plugins/command-executions | |

# **pluginControllerGetAll**
> PluginsResponse pluginControllerGetAll()

Get list of available plugins

### Example

```typescript
import {
    PluginsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PluginsApi(configuration);

const { status, data } = await apiInstance.pluginControllerGetAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PluginsResponse**

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

# **pluginsControllerGetPluginCommands**
> Array<string> pluginsControllerGetPluginCommands()

Get Redis whitelist commands available for plugins

### Example

```typescript
import {
    PluginsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PluginsApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)

const { status, data } = await apiInstance.pluginsControllerGetPluginCommands(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


### Return type

**Array<string>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of available commands |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **pluginsControllerGetState**
> PluginState pluginsControllerGetState()

Get previously saved state

### Example

```typescript
import {
    PluginsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PluginsApi(configuration);

let visualizationId: string; // (default to undefined)
let id: string; // (default to undefined)
let dbInstance: string; //Database instance id. (default to undefined)

const { status, data } = await apiInstance.pluginsControllerGetState(
    visualizationId,
    id,
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **visualizationId** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


### Return type

**PluginState**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Plugin state |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **pluginsControllerSaveState**
> pluginsControllerSaveState(createPluginStateDto)

Save plugin state for particular command execution

### Example

```typescript
import {
    PluginsApi,
    Configuration,
    CreatePluginStateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PluginsApi(configuration);

let visualizationId: string; // (default to undefined)
let id: string; // (default to undefined)
let dbInstance: string; //Database instance id. (default to undefined)
let createPluginStateDto: CreatePluginStateDto; //

const { status, data } = await apiInstance.pluginsControllerSaveState(
    visualizationId,
    id,
    dbInstance,
    createPluginStateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPluginStateDto** | **CreatePluginStateDto**|  | |
| **visualizationId** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **pluginsControllerSendCommand**
> PluginCommandExecution pluginsControllerSendCommand(createCommandExecutionDto)

Send Redis Command from the Workbench

### Example

```typescript
import {
    PluginsApi,
    Configuration,
    CreateCommandExecutionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PluginsApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let createCommandExecutionDto: CreateCommandExecutionDto; //

const { status, data } = await apiInstance.pluginsControllerSendCommand(
    dbInstance,
    createCommandExecutionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommandExecutionDto** | **CreateCommandExecutionDto**|  | |
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


### Return type

**PluginCommandExecution**

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

