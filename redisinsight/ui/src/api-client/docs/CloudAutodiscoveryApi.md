# CloudAutodiscoveryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cloudAutodiscoveryControllerAddDiscoveredDatabases**](#cloudautodiscoverycontrolleradddiscovereddatabases) | **POST** /api/cloud/autodiscovery/databases | |
|[**cloudAutodiscoveryControllerDiscoverDatabases**](#cloudautodiscoverycontrollerdiscoverdatabases) | **POST** /api/cloud/autodiscovery/get-databases | |
|[**cloudAutodiscoveryControllerDiscoverSubscriptions**](#cloudautodiscoverycontrollerdiscoversubscriptions) | **GET** /api/cloud/autodiscovery/subscriptions | |
|[**cloudAutodiscoveryControllerGetAccount**](#cloudautodiscoverycontrollergetaccount) | **GET** /api/cloud/autodiscovery/account | |
|[**meCloudAutodiscoveryControllerAddDiscoveredDatabases**](#mecloudautodiscoverycontrolleradddiscovereddatabases) | **POST** /api/cloud/me/autodiscovery/databases | |
|[**meCloudAutodiscoveryControllerDiscoverDatabases**](#mecloudautodiscoverycontrollerdiscoverdatabases) | **POST** /api/cloud/me/autodiscovery/get-databases | |
|[**meCloudAutodiscoveryControllerDiscoverSubscriptions**](#mecloudautodiscoverycontrollerdiscoversubscriptions) | **GET** /api/cloud/me/autodiscovery/subscriptions | |
|[**meCloudAutodiscoveryControllerGetAccount**](#mecloudautodiscoverycontrollergetaccount) | **GET** /api/cloud/me/autodiscovery/account | |

# **cloudAutodiscoveryControllerAddDiscoveredDatabases**
> Array<ImportCloudDatabaseResponse> cloudAutodiscoveryControllerAddDiscoveredDatabases(importCloudDatabasesDto)

Add databases from Redis Enterprise Cloud Pro account.

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration,
    ImportCloudDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let importCloudDatabasesDto: ImportCloudDatabasesDto; //
let xCloudApiKey: string; // (optional) (default to undefined)
let xCloudApiSecret: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudAutodiscoveryControllerAddDiscoveredDatabases(
    importCloudDatabasesDto,
    xCloudApiKey,
    xCloudApiSecret
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **importCloudDatabasesDto** | **ImportCloudDatabasesDto**|  | |
| **xCloudApiKey** | [**string**] |  | (optional) defaults to undefined|
| **xCloudApiSecret** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<ImportCloudDatabaseResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Added databases list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cloudAutodiscoveryControllerDiscoverDatabases**
> Array<CloudDatabase> cloudAutodiscoveryControllerDiscoverDatabases(discoverCloudDatabasesDto)

Get databases belonging to subscriptions

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration,
    DiscoverCloudDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let discoverCloudDatabasesDto: DiscoverCloudDatabasesDto; //
let xCloudApiKey: string; // (optional) (default to undefined)
let xCloudApiSecret: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudAutodiscoveryControllerDiscoverDatabases(
    discoverCloudDatabasesDto,
    xCloudApiKey,
    xCloudApiSecret
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **discoverCloudDatabasesDto** | **DiscoverCloudDatabasesDto**|  | |
| **xCloudApiKey** | [**string**] |  | (optional) defaults to undefined|
| **xCloudApiSecret** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<CloudDatabase>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Databases list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cloudAutodiscoveryControllerDiscoverSubscriptions**
> Array<CloudSubscription> cloudAutodiscoveryControllerDiscoverSubscriptions()

Get information about current account’s subscriptions.

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let xCloudApiKey: string; // (optional) (default to undefined)
let xCloudApiSecret: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudAutodiscoveryControllerDiscoverSubscriptions(
    xCloudApiKey,
    xCloudApiSecret
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xCloudApiKey** | [**string**] |  | (optional) defaults to undefined|
| **xCloudApiSecret** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<CloudSubscription>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redis cloud subscription list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cloudAutodiscoveryControllerGetAccount**
> CloudAccountInfo cloudAutodiscoveryControllerGetAccount()

Get current account

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let xCloudApiKey: string; // (optional) (default to undefined)
let xCloudApiSecret: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.cloudAutodiscoveryControllerGetAccount(
    xCloudApiKey,
    xCloudApiSecret
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xCloudApiKey** | [**string**] |  | (optional) defaults to undefined|
| **xCloudApiSecret** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CloudAccountInfo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Account Details. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **meCloudAutodiscoveryControllerAddDiscoveredDatabases**
> Array<ImportCloudDatabaseResponse> meCloudAutodiscoveryControllerAddDiscoveredDatabases(importCloudDatabasesDto)

Add databases from Redis Enterprise Cloud Pro account.

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration,
    ImportCloudDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let importCloudDatabasesDto: ImportCloudDatabasesDto; //
let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.meCloudAutodiscoveryControllerAddDiscoveredDatabases(
    importCloudDatabasesDto,
    source,
    medium,
    campaign,
    amp,
    _package
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **importCloudDatabasesDto** | **ImportCloudDatabasesDto**|  | |
| **source** | [**string**] |  | (optional) defaults to 'redisinsight'|
| **medium** | [**string**] |  | (optional) defaults to undefined|
| **campaign** | [**string**] |  | (optional) defaults to undefined|
| **amp** | [**string**] |  | (optional) defaults to undefined|
| **_package** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<ImportCloudDatabaseResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Added databases list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **meCloudAutodiscoveryControllerDiscoverDatabases**
> Array<CloudDatabase> meCloudAutodiscoveryControllerDiscoverDatabases(discoverCloudDatabasesDto)

Get databases belonging to subscriptions

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration,
    DiscoverCloudDatabasesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let discoverCloudDatabasesDto: DiscoverCloudDatabasesDto; //
let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.meCloudAutodiscoveryControllerDiscoverDatabases(
    discoverCloudDatabasesDto,
    source,
    medium,
    campaign,
    amp,
    _package
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **discoverCloudDatabasesDto** | **DiscoverCloudDatabasesDto**|  | |
| **source** | [**string**] |  | (optional) defaults to 'redisinsight'|
| **medium** | [**string**] |  | (optional) defaults to undefined|
| **campaign** | [**string**] |  | (optional) defaults to undefined|
| **amp** | [**string**] |  | (optional) defaults to undefined|
| **_package** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<CloudDatabase>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Databases list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **meCloudAutodiscoveryControllerDiscoverSubscriptions**
> Array<CloudSubscription> meCloudAutodiscoveryControllerDiscoverSubscriptions()

Get information about current account’s subscriptions.

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.meCloudAutodiscoveryControllerDiscoverSubscriptions(
    source,
    medium,
    campaign,
    amp,
    _package
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **source** | [**string**] |  | (optional) defaults to 'redisinsight'|
| **medium** | [**string**] |  | (optional) defaults to undefined|
| **campaign** | [**string**] |  | (optional) defaults to undefined|
| **amp** | [**string**] |  | (optional) defaults to undefined|
| **_package** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<CloudSubscription>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redis cloud subscription list. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **meCloudAutodiscoveryControllerGetAccount**
> CloudAccountInfo meCloudAutodiscoveryControllerGetAccount()

Get current account

### Example

```typescript
import {
    CloudAutodiscoveryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudAutodiscoveryApi(configuration);

let source: string; // (optional) (default to 'redisinsight')
let medium: string; // (optional) (default to undefined)
let campaign: string; // (optional) (default to undefined)
let amp: string; // (optional) (default to undefined)
let _package: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.meCloudAutodiscoveryControllerGetAccount(
    source,
    medium,
    campaign,
    amp,
    _package
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **source** | [**string**] |  | (optional) defaults to 'redisinsight'|
| **medium** | [**string**] |  | (optional) defaults to undefined|
| **campaign** | [**string**] |  | (optional) defaults to undefined|
| **amp** | [**string**] |  | (optional) defaults to undefined|
| **_package** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CloudAccountInfo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Account Details. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

