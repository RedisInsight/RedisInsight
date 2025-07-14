# WorkbenchApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**workbenchControllerDeleteCommandExecution**](#workbenchcontrollerdeletecommandexecution) | **DELETE** /api/databases/{dbInstance}/workbench/command-executions/{id} | |
|[**workbenchControllerDeleteCommandExecutions**](#workbenchcontrollerdeletecommandexecutions) | **DELETE** /api/databases/{dbInstance}/workbench/command-executions | |
|[**workbenchControllerGetCommandExecution**](#workbenchcontrollergetcommandexecution) | **GET** /api/databases/{dbInstance}/workbench/command-executions/{id} | |
|[**workbenchControllerListCommandExecutions**](#workbenchcontrollerlistcommandexecutions) | **GET** /api/databases/{dbInstance}/workbench/command-executions | |
|[**workbenchControllerSendCommands**](#workbenchcontrollersendcommands) | **POST** /api/databases/{dbInstance}/workbench/command-executions | |

# **workbenchControllerDeleteCommandExecution**
> workbenchControllerDeleteCommandExecution()

Delete command execution

### Example

```typescript
import {
    WorkbenchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkbenchApi(configuration);

let id: string; // (default to undefined)
let dbInstance: string; //Database instance id. (default to undefined)

const { status, data } = await apiInstance.workbenchControllerDeleteCommandExecution(
    id,
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


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

# **workbenchControllerDeleteCommandExecutions**
> workbenchControllerDeleteCommandExecutions(commandExecutionFilter)

Delete command executions

### Example

```typescript
import {
    WorkbenchApi,
    Configuration,
    CommandExecutionFilter
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkbenchApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let commandExecutionFilter: CommandExecutionFilter; //

const { status, data } = await apiInstance.workbenchControllerDeleteCommandExecutions(
    dbInstance,
    commandExecutionFilter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **commandExecutionFilter** | **CommandExecutionFilter**|  | |
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **workbenchControllerGetCommandExecution**
> CommandExecution workbenchControllerGetCommandExecution()

Get command execution details

### Example

```typescript
import {
    WorkbenchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkbenchApi(configuration);

let id: string; // (default to undefined)
let dbInstance: string; //Database instance id. (default to undefined)

const { status, data } = await apiInstance.workbenchControllerGetCommandExecution(
    id,
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


### Return type

**CommandExecution**

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

# **workbenchControllerListCommandExecutions**
> Array<ShortCommandExecution> workbenchControllerListCommandExecutions()

List of command executions

### Example

```typescript
import {
    WorkbenchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkbenchApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let type: 'WORKBENCH' | 'SEARCH'; //Command execution type. Used to distinguish between search and workbench (optional) (default to 'WORKBENCH')

const { status, data } = await apiInstance.workbenchControllerListCommandExecutions(
    dbInstance,
    type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|
| **type** | [**&#39;WORKBENCH&#39; | &#39;SEARCH&#39;**]**Array<&#39;WORKBENCH&#39; &#124; &#39;SEARCH&#39;>** | Command execution type. Used to distinguish between search and workbench | (optional) defaults to 'WORKBENCH'|


### Return type

**Array<ShortCommandExecution>**

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

# **workbenchControllerSendCommands**
> CommandExecution workbenchControllerSendCommands(createCommandExecutionsDto)

Send Redis Batch Commands from the Workbench

### Example

```typescript
import {
    WorkbenchApi,
    Configuration,
    CreateCommandExecutionsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new WorkbenchApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)
let createCommandExecutionsDto: CreateCommandExecutionsDto; //

const { status, data } = await apiInstance.workbenchControllerSendCommands(
    dbInstance,
    createCommandExecutionsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommandExecutionsDto** | **CreateCommandExecutionsDto**|  | |
| **dbInstance** | [**string**] | Database instance id. | defaults to undefined|


### Return type

**CommandExecution**

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

