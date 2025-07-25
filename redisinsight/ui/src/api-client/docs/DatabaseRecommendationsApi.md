# DatabaseRecommendationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**databaseRecommendationControllerBulkDeleteDatabaseRecommendation**](#databaserecommendationcontrollerbulkdeletedatabaserecommendation) | **DELETE** /api/databases/{dbInstance}/recommendations | |
|[**databaseRecommendationControllerList**](#databaserecommendationcontrollerlist) | **GET** /api/databases/{dbInstance}/recommendations | |
|[**databaseRecommendationControllerModify**](#databaserecommendationcontrollermodify) | **PATCH** /api/databases/{dbInstance}/recommendations/{id} | |
|[**databaseRecommendationControllerRead**](#databaserecommendationcontrollerread) | **PATCH** /api/databases/{dbInstance}/recommendations/read | |

# **databaseRecommendationControllerBulkDeleteDatabaseRecommendation**
> DeleteDatabaseRecommendationResponse databaseRecommendationControllerBulkDeleteDatabaseRecommendation(deleteDatabaseRecommendationDto)

Delete many recommendations by ids

### Example

```typescript
import {
    DatabaseRecommendationsApi,
    Configuration,
    DeleteDatabaseRecommendationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseRecommendationsApi(configuration);

let dbInstance: string; // (default to undefined)
let deleteDatabaseRecommendationDto: DeleteDatabaseRecommendationDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseRecommendationControllerBulkDeleteDatabaseRecommendation(
    dbInstance,
    deleteDatabaseRecommendationDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteDatabaseRecommendationDto** | **DeleteDatabaseRecommendationDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteDatabaseRecommendationResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete many recommendations by ids response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseRecommendationControllerList**
> DatabaseRecommendationsResponse databaseRecommendationControllerList()

Get database recommendations

### Example

```typescript
import {
    DatabaseRecommendationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseRecommendationsApi(configuration);

let dbInstance: string; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseRecommendationControllerList(
    dbInstance,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DatabaseRecommendationsResponse**

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

# **databaseRecommendationControllerModify**
> DatabaseRecommendation databaseRecommendationControllerModify(modifyDatabaseRecommendationDto)

Update database recommendation by id

### Example

```typescript
import {
    DatabaseRecommendationsApi,
    Configuration,
    ModifyDatabaseRecommendationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseRecommendationsApi(configuration);

let id: string; // (default to undefined)
let dbInstance: string; // (default to undefined)
let modifyDatabaseRecommendationDto: ModifyDatabaseRecommendationDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseRecommendationControllerModify(
    id,
    dbInstance,
    modifyDatabaseRecommendationDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **modifyDatabaseRecommendationDto** | **ModifyDatabaseRecommendationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DatabaseRecommendation**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated database recommendation\&#39; response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseRecommendationControllerRead**
> databaseRecommendationControllerRead()

Mark all database recommendations as read

### Example

```typescript
import {
    DatabaseRecommendationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseRecommendationsApi(configuration);

let dbInstance: string; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseRecommendationControllerRead(
    dbInstance,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


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

