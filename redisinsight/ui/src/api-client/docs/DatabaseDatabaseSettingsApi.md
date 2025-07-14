# DatabaseDatabaseSettingsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**databaseSettingsControllerCreate**](#databasesettingscontrollercreate) | **POST** /api/databases/{dbInstance}/settings | |
|[**databaseSettingsControllerDelete**](#databasesettingscontrollerdelete) | **DELETE** /api/databases/{dbInstance}/settings | |
|[**databaseSettingsControllerGet**](#databasesettingscontrollerget) | **GET** /api/databases/{dbInstance}/settings | |

# **databaseSettingsControllerCreate**
> DatabaseSettings databaseSettingsControllerCreate(createOrUpdateDatabaseSettingDto)

Update database settings

### Example

```typescript
import {
    DatabaseDatabaseSettingsApi,
    Configuration,
    CreateOrUpdateDatabaseSettingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseDatabaseSettingsApi(configuration);

let dbInstance: string; // (default to undefined)
let createOrUpdateDatabaseSettingDto: CreateOrUpdateDatabaseSettingDto; //

const { status, data } = await apiInstance.databaseSettingsControllerCreate(
    dbInstance,
    createOrUpdateDatabaseSettingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createOrUpdateDatabaseSettingDto** | **CreateOrUpdateDatabaseSettingDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|


### Return type

**DatabaseSettings**

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

# **databaseSettingsControllerDelete**
> databaseSettingsControllerDelete()

Delete database settings

### Example

```typescript
import {
    DatabaseDatabaseSettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseDatabaseSettingsApi(configuration);

let dbInstance: string; //Database instance id. (default to undefined)

const { status, data } = await apiInstance.databaseSettingsControllerDelete(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **databaseSettingsControllerGet**
> DatabaseSettings databaseSettingsControllerGet()

Get database settings

### Example

```typescript
import {
    DatabaseDatabaseSettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseDatabaseSettingsApi(configuration);

let dbInstance: string; // (default to undefined)

const { status, data } = await apiInstance.databaseSettingsControllerGet(
    dbInstance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dbInstance** | [**string**] |  | defaults to undefined|


### Return type

**DatabaseSettings**

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

