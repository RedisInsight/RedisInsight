# DatabaseApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**databaseControllerBulkDeleteDatabaseInstance**](#databasecontrollerbulkdeletedatabaseinstance) | **DELETE** /api/databases | |
|[**databaseControllerClone**](#databasecontrollerclone) | **POST** /api/databases/clone/{id} | |
|[**databaseControllerConnect**](#databasecontrollerconnect) | **GET** /api/databases/{id}/connect | |
|[**databaseControllerCreate**](#databasecontrollercreate) | **POST** /api/databases | |
|[**databaseControllerDeleteDatabaseInstance**](#databasecontrollerdeletedatabaseinstance) | **DELETE** /api/databases/{id} | |
|[**databaseControllerExportConnections**](#databasecontrollerexportconnections) | **POST** /api/databases/export | |
|[**databaseControllerGet**](#databasecontrollerget) | **GET** /api/databases/{id} | |
|[**databaseControllerList**](#databasecontrollerlist) | **GET** /api/databases | |
|[**databaseControllerTestConnection**](#databasecontrollertestconnection) | **POST** /api/databases/test | |
|[**databaseControllerTestExistConnection**](#databasecontrollertestexistconnection) | **POST** /api/databases/test/{id} | |
|[**databaseControllerUpdate**](#databasecontrollerupdate) | **PATCH** /api/databases/{id} | |
|[**databaseImportControllerImport**](#databaseimportcontrollerimport) | **POST** /api/databases/import | |

# **databaseControllerBulkDeleteDatabaseInstance**
> DeleteDatabasesDto databaseControllerBulkDeleteDatabaseInstance(deleteDatabasesDto)

Delete many databases by ids

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    DeleteDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let deleteDatabasesDto: DeleteDatabasesDto; //

const { status, data } = await apiInstance.databaseControllerBulkDeleteDatabaseInstance(
    deleteDatabasesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteDatabasesDto** | **DeleteDatabasesDto**|  | |


### Return type

**DeleteDatabasesDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete many databases by ids response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseControllerClone**
> DatabaseResponse databaseControllerClone(updateDatabaseDto)

Update database instance by id

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    UpdateDatabaseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let id: string; // (default to undefined)
let updateDatabaseDto: UpdateDatabaseDto; //

const { status, data } = await apiInstance.databaseControllerClone(
    id,
    updateDatabaseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateDatabaseDto** | **UpdateDatabaseDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DatabaseResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated database instance\&#39; response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseControllerConnect**
> databaseControllerConnect()

Connect to database instance by id

### Example

```typescript
import {
    DatabaseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.databaseControllerConnect(
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
|**200** | Successfully connected to database instance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseControllerCreate**
> DatabaseResponse databaseControllerCreate(createDatabaseDto)

Add database instance

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    CreateDatabaseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let createDatabaseDto: CreateDatabaseDto; //

const { status, data } = await apiInstance.databaseControllerCreate(
    createDatabaseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createDatabaseDto** | **CreateDatabaseDto**|  | |


### Return type

**DatabaseResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created database instance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseControllerDeleteDatabaseInstance**
> databaseControllerDeleteDatabaseInstance()

Delete database instance by id

### Example

```typescript
import {
    DatabaseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.databaseControllerDeleteDatabaseInstance(
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

# **databaseControllerExportConnections**
> ExportDatabase databaseControllerExportConnections(exportDatabasesDto)

Export many databases by ids. With or without passwords and certificates bodies.

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    ExportDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let exportDatabasesDto: ExportDatabasesDto; //

const { status, data } = await apiInstance.databaseControllerExportConnections(
    exportDatabasesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **exportDatabasesDto** | **ExportDatabasesDto**|  | |


### Return type

**ExportDatabase**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Export many databases by ids response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseControllerGet**
> DatabaseResponse databaseControllerGet()

Get database instance by id

### Example

```typescript
import {
    DatabaseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.databaseControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DatabaseResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Database instance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseControllerList**
> Array<Database> databaseControllerList()

Get databases list

### Example

```typescript
import {
    DatabaseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

const { status, data } = await apiInstance.databaseControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Database>**

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

# **databaseControllerTestConnection**
> databaseControllerTestConnection(createDatabaseDto)

Test connection

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    CreateDatabaseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let createDatabaseDto: CreateDatabaseDto; //

const { status, data } = await apiInstance.databaseControllerTestConnection(
    createDatabaseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createDatabaseDto** | **CreateDatabaseDto**|  | |


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

# **databaseControllerTestExistConnection**
> databaseControllerTestExistConnection(updateDatabaseDto)

Test connection

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    UpdateDatabaseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let id: string; // (default to undefined)
let updateDatabaseDto: UpdateDatabaseDto; //

const { status, data } = await apiInstance.databaseControllerTestExistConnection(
    id,
    updateDatabaseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateDatabaseDto** | **UpdateDatabaseDto**|  | |
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

# **databaseControllerUpdate**
> DatabaseResponse databaseControllerUpdate(updateDatabaseDto)

Update database instance by id

### Example

```typescript
import {
    DatabaseApi,
    Configuration,
    UpdateDatabaseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let id: string; // (default to undefined)
let updateDatabaseDto: UpdateDatabaseDto; //

const { status, data } = await apiInstance.databaseControllerUpdate(
    id,
    updateDatabaseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateDatabaseDto** | **UpdateDatabaseDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DatabaseResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Updated database instance\&#39; response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **databaseImportControllerImport**
> DatabaseImportResponse databaseImportControllerImport()


### Example

```typescript
import {
    DatabaseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatabaseApi(configuration);

let file: File; // (optional) (default to undefined)

const { status, data } = await apiInstance.databaseImportControllerImport(
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] |  | (optional) defaults to undefined|


### Return type

**DatabaseImportResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

