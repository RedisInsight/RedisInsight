# DatabaseAnalysisApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**databaseAnalysisControllerCreate**](#databaseanalysiscontrollercreate) | **POST** /api/databases/{dbInstance}/analysis | |
|[**databaseAnalysisControllerGet**](#databaseanalysiscontrollerget) | **GET** /api/databases/{dbInstance}/analysis/{id} | |
|[**databaseAnalysisControllerList**](#databaseanalysiscontrollerlist) | **GET** /api/databases/{dbInstance}/analysis | |
|[**databaseAnalysisControllerModify**](#databaseanalysiscontrollermodify) | **PATCH** /api/databases/{dbInstance}/analysis/{id} | |

# **databaseAnalysisControllerCreate**
> DatabaseAnalysis databaseAnalysisControllerCreate(createDatabaseAnalysisDto)

Create new database analysis

### Example

```typescript
import {
    DatabaseAnalysisApi,
    Configuration,
    CreateDatabaseAnalysisDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseAnalysisApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let createDatabaseAnalysisDto: CreateDatabaseAnalysisDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseAnalysisControllerCreate(
    dbInstance,
    encoding,
    createDatabaseAnalysisDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createDatabaseAnalysisDto** | **CreateDatabaseAnalysisDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DatabaseAnalysis**

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

# **databaseAnalysisControllerGet**
> DatabaseAnalysis databaseAnalysisControllerGet()

Get database analysis

### Example

```typescript
import {
    DatabaseAnalysisApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseAnalysisApi(configuration);

let id: string; //Analysis id (default to undefined)
let dbInstance: string; //Database instance id (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)

const { status, data } = await apiInstance.databaseAnalysisControllerGet(
    id,
    dbInstance,
    encoding
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Analysis id | defaults to undefined|
| **dbInstance** | [**string**] | Database instance id | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|


### Return type

**DatabaseAnalysis**

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

# **databaseAnalysisControllerList**
> Array<ShortDatabaseAnalysis> databaseAnalysisControllerList()

Get database analysis list

### Example

```typescript
import {
    DatabaseAnalysisApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseAnalysisApi(configuration);

let dbInstance: string; //Database instance id (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)

const { status, data } = await apiInstance.databaseAnalysisControllerList(
    dbInstance,
    encoding
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] | Database instance id | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|


### Return type

**Array<ShortDatabaseAnalysis>**

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

# **databaseAnalysisControllerModify**
> DatabaseAnalysis databaseAnalysisControllerModify(recommendationVoteDto)

Update database analysis by id

### Example

```typescript
import {
    DatabaseAnalysisApi,
    Configuration,
    RecommendationVoteDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseAnalysisApi(configuration);

let id: string; //Analysis id (default to undefined)
let dbInstance: string; //Database instance id (default to undefined)
let recommendationVoteDto: RecommendationVoteDto; //

const { status, data } = await apiInstance.databaseAnalysisControllerModify(
    id,
    dbInstance,
    recommendationVoteDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recommendationVoteDto** | **RecommendationVoteDto**|  | |
| **id** | [**string**] | Analysis id | defaults to undefined|
| **dbInstance** | [**string**] | Database instance id | defaults to undefined|


### Return type

**DatabaseAnalysis**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated database analysis response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

