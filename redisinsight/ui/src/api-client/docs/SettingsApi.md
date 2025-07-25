# SettingsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**settingsControllerGetAgreementsSpec**](#settingscontrollergetagreementsspec) | **GET** /api/settings/agreements/spec | |
|[**settingsControllerGetAppSettings**](#settingscontrollergetappsettings) | **GET** /api/settings | |
|[**settingsControllerUpdate**](#settingscontrollerupdate) | **PATCH** /api/settings | |

# **settingsControllerGetAgreementsSpec**
> GetAgreementsSpecResponse settingsControllerGetAgreementsSpec()

Get json with agreements specification

### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

const { status, data } = await apiInstance.settingsControllerGetAgreementsSpec();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetAgreementsSpecResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Agreements specification |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerGetAppSettings**
> GetAppSettingsResponse settingsControllerGetAppSettings()

Get info about application settings

### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

const { status, data } = await apiInstance.settingsControllerGetAppSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetAppSettingsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Application settings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **settingsControllerUpdate**
> GetAppSettingsResponse settingsControllerUpdate(updateSettingsDto)

Update user application settings and agreements

### Example

```typescript
import {
    SettingsApi,
    Configuration,
    UpdateSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let updateSettingsDto: UpdateSettingsDto; //

const { status, data } = await apiInstance.settingsControllerUpdate(
    updateSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSettingsDto** | **UpdateSettingsDto**|  | |


### Return type

**GetAppSettingsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Application settings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

