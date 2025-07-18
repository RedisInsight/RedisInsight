# BulkActionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**bulkImportControllerImport**](#bulkimportcontrollerimport) | **POST** /api/databases/{dbInstance}/bulk-actions/import | |
|[**bulkImportControllerImportDefaultData**](#bulkimportcontrollerimportdefaultdata) | **POST** /api/databases/{dbInstance}/bulk-actions/import/default-data | |
|[**bulkImportControllerUploadFromTutorial**](#bulkimportcontrolleruploadfromtutorial) | **POST** /api/databases/{dbInstance}/bulk-actions/import/tutorial-data | |

# **bulkImportControllerImport**
> object bulkImportControllerImport()

Import data from file

### Example

```typescript
import {
    BulkActionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BulkActionsApi(configuration);

let dbInstance: string; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.bulkImportControllerImport(
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

**object**

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

# **bulkImportControllerImportDefaultData**
> object bulkImportControllerImportDefaultData()

Import default data

### Example

```typescript
import {
    BulkActionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BulkActionsApi(configuration);

let dbInstance: string; // (default to undefined)
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.bulkImportControllerImportDefaultData(
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

**object**

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

# **bulkImportControllerUploadFromTutorial**
> object bulkImportControllerUploadFromTutorial(uploadImportFileByPathDto)

Import data from tutorial by path

### Example

```typescript
import {
    BulkActionsApi,
    Configuration,
    UploadImportFileByPathDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BulkActionsApi(configuration);

let dbInstance: string; // (default to undefined)
let uploadImportFileByPathDto: UploadImportFileByPathDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.bulkImportControllerUploadFromTutorial(
    dbInstance,
    uploadImportFileByPathDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uploadImportFileByPathDto** | **UploadImportFileByPathDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**object**

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

