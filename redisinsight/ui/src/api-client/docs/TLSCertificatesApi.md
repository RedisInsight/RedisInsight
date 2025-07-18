# TLSCertificatesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**caCertificateControllerDelete**](#cacertificatecontrollerdelete) | **DELETE** /api/certificates/ca/{id} | |
|[**caCertificateControllerList**](#cacertificatecontrollerlist) | **GET** /api/certificates/ca | |
|[**clientCertificateControllerDeleteClientCertificatePair**](#clientcertificatecontrollerdeleteclientcertificatepair) | **DELETE** /api/certificates/client/{id} | |
|[**clientCertificateControllerGetClientCertList**](#clientcertificatecontrollergetclientcertlist) | **GET** /api/certificates/client | |

# **caCertificateControllerDelete**
> caCertificateControllerDelete()

Delete Ca Certificate by id

### Example

```typescript
import {
    TLSCertificatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TLSCertificatesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.caCertificateControllerDelete(
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

# **caCertificateControllerList**
> Array<CaCertificate> caCertificateControllerList()

Get Ca Certificate list

### Example

```typescript
import {
    TLSCertificatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TLSCertificatesApi(configuration);

const { status, data } = await apiInstance.caCertificateControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CaCertificate>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Ca Certificate list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **clientCertificateControllerDeleteClientCertificatePair**
> clientCertificateControllerDeleteClientCertificatePair()

Delete Client Certificate pair by id

### Example

```typescript
import {
    TLSCertificatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TLSCertificatesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.clientCertificateControllerDeleteClientCertificatePair(
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

# **clientCertificateControllerGetClientCertList**
> Array<ClientCertificate> clientCertificateControllerGetClientCertList()

Get Client Certificate list

### Example

```typescript
import {
    TLSCertificatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TLSCertificatesApi(configuration);

const { status, data } = await apiInstance.clientCertificateControllerGetClientCertList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ClientCertificate>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Client Certificate list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

