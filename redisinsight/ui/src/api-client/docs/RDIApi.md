# RDIApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**rdiControllerConnect**](#rdicontrollerconnect) | **GET** /api/rdi/{id}/connect | |
|[**rdiControllerCreate**](#rdicontrollercreate) | **POST** /api/rdi | |
|[**rdiControllerDelete**](#rdicontrollerdelete) | **DELETE** /api/rdi | |
|[**rdiControllerGet**](#rdicontrollerget) | **GET** /api/rdi/{id} | |
|[**rdiControllerList**](#rdicontrollerlist) | **GET** /api/rdi | |
|[**rdiControllerUpdate**](#rdicontrollerupdate) | **PATCH** /api/rdi/{id} | |
|[**rdiPipelineControllerDeploy**](#rdipipelinecontrollerdeploy) | **POST** /api/rdi/{id}/pipeline/deploy | |
|[**rdiPipelineControllerDryRunJob**](#rdipipelinecontrollerdryrunjob) | **POST** /api/rdi/{id}/pipeline/dry-run-job | |
|[**rdiPipelineControllerGetConfigTemplate**](#rdipipelinecontrollergetconfigtemplate) | **GET** /api/rdi/{id}/pipeline/config/template/{pipelineType}/{dbType} | |
|[**rdiPipelineControllerGetJobFunctions**](#rdipipelinecontrollergetjobfunctions) | **GET** /api/rdi/{id}/pipeline/job-functions | |
|[**rdiPipelineControllerGetJobTemplate**](#rdipipelinecontrollergetjobtemplate) | **GET** /api/rdi/{id}/pipeline/job/template/{pipelineType} | |
|[**rdiPipelineControllerGetPipeline**](#rdipipelinecontrollergetpipeline) | **GET** /api/rdi/{id}/pipeline | |
|[**rdiPipelineControllerGetPipelineStatus**](#rdipipelinecontrollergetpipelinestatus) | **GET** /api/rdi/{id}/pipeline/status | |
|[**rdiPipelineControllerGetSchema**](#rdipipelinecontrollergetschema) | **GET** /api/rdi/{id}/pipeline/schema | |
|[**rdiPipelineControllerGetStrategies**](#rdipipelinecontrollergetstrategies) | **GET** /api/rdi/{id}/pipeline/strategies | |
|[**rdiPipelineControllerResetPipeline**](#rdipipelinecontrollerresetpipeline) | **POST** /api/rdi/{id}/pipeline/reset | |
|[**rdiPipelineControllerStartPipeline**](#rdipipelinecontrollerstartpipeline) | **POST** /api/rdi/{id}/pipeline/start | |
|[**rdiPipelineControllerStopPipeline**](#rdipipelinecontrollerstoppipeline) | **POST** /api/rdi/{id}/pipeline/stop | |
|[**rdiPipelineControllerTestConnections**](#rdipipelinecontrollertestconnections) | **POST** /api/rdi/{id}/pipeline/test-connections | |
|[**rdiStatisticsControllerGetStatistics**](#rdistatisticscontrollergetstatistics) | **GET** /api/rdi/{id}/statistics | |

# **rdiControllerConnect**
> rdiControllerConnect()

Connect to RDI

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiControllerConnect(
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
|**200** | Successfully connected to rdi instance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rdiControllerCreate**
> Rdi rdiControllerCreate(createRdiDto)

Create RDI

### Example

```typescript
import {
    RDIApi,
    Configuration,
    CreateRdiDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let createRdiDto: CreateRdiDto; //

const { status, data } = await apiInstance.rdiControllerCreate(
    createRdiDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createRdiDto** | **CreateRdiDto**|  | |


### Return type

**Rdi**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rdiControllerDelete**
> rdiControllerDelete()

Delete RDI

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

const { status, data } = await apiInstance.rdiControllerDelete();
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

# **rdiControllerGet**
> Rdi rdiControllerGet()

Get RDI by id

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Rdi**

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

# **rdiControllerList**
> Array<Rdi> rdiControllerList()

Get RDI list

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

const { status, data } = await apiInstance.rdiControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Rdi>**

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

# **rdiControllerUpdate**
> Rdi rdiControllerUpdate(updateRdiDto)

Update RDI

### Example

```typescript
import {
    RDIApi,
    Configuration,
    UpdateRdiDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)
let updateRdiDto: UpdateRdiDto; //

const { status, data } = await apiInstance.rdiControllerUpdate(
    id,
    updateRdiDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateRdiDto** | **UpdateRdiDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Rdi**

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

# **rdiPipelineControllerDeploy**
> rdiPipelineControllerDeploy(body)

Deploy the pipeline

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)
let body: object; //

const { status, data } = await apiInstance.rdiPipelineControllerDeploy(
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |
| **id** | [**string**] |  | defaults to undefined|


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

# **rdiPipelineControllerDryRunJob**
> RdiDryRunJobResponseDto rdiPipelineControllerDryRunJob(rdiDryRunJobDto)

Dry run job

### Example

```typescript
import {
    RDIApi,
    Configuration,
    RdiDryRunJobDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)
let rdiDryRunJobDto: RdiDryRunJobDto; //

const { status, data } = await apiInstance.rdiPipelineControllerDryRunJob(
    id,
    rdiDryRunJobDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **rdiDryRunJobDto** | **RdiDryRunJobDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RdiDryRunJobResponseDto**

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

# **rdiPipelineControllerGetConfigTemplate**
> RdiTemplateResponseDto rdiPipelineControllerGetConfigTemplate()

Get config template for selected pipeline and db types

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let pipelineType: string; // (default to undefined)
let dbType: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetConfigTemplate(
    pipelineType,
    dbType,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pipelineType** | [**string**] |  | defaults to undefined|
| **dbType** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RdiTemplateResponseDto**

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

# **rdiPipelineControllerGetJobFunctions**
> rdiPipelineControllerGetJobFunctions()

Get job functions

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetJobFunctions(
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

# **rdiPipelineControllerGetJobTemplate**
> RdiTemplateResponseDto rdiPipelineControllerGetJobTemplate()

Get job template for selected pipeline type

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let pipelineType: string; // (default to undefined)
let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetJobTemplate(
    pipelineType,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pipelineType** | [**string**] |  | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RdiTemplateResponseDto**

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

# **rdiPipelineControllerGetPipeline**
> object rdiPipelineControllerGetPipeline()

Get pipeline

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetPipeline(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**object**

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

# **rdiPipelineControllerGetPipelineStatus**
> rdiPipelineControllerGetPipelineStatus()

Get pipeline status

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetPipelineStatus(
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

# **rdiPipelineControllerGetSchema**
> object rdiPipelineControllerGetSchema()

Get pipeline schema

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetSchema(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**object**

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

# **rdiPipelineControllerGetStrategies**
> object rdiPipelineControllerGetStrategies()

Get pipeline strategies and db types for template

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerGetStrategies(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**object**

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

# **rdiPipelineControllerResetPipeline**
> rdiPipelineControllerResetPipeline()

Resets default pipeline

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerResetPipeline(
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

# **rdiPipelineControllerStartPipeline**
> rdiPipelineControllerStartPipeline()

Starts the stopped pipeline

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerStartPipeline(
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

# **rdiPipelineControllerStopPipeline**
> rdiPipelineControllerStopPipeline()

Stops running pipeline

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerStopPipeline(
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

# **rdiPipelineControllerTestConnections**
> RdiTestConnectionsResponseDto rdiPipelineControllerTestConnections()

Test target connections

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.rdiPipelineControllerTestConnections(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RdiTestConnectionsResponseDto**

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

# **rdiStatisticsControllerGetStatistics**
> object rdiStatisticsControllerGetStatistics()

Get statistics

### Example

```typescript
import {
    RDIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RDIApi(configuration);

let id: string; // (default to undefined)
let sections: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.rdiStatisticsControllerGetStatistics(
    id,
    sections
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **sections** | [**string**] |  | (optional) defaults to undefined|


### Return type

**object**

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

