# BrowserStreamsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**consumerControllerAckPendingEntries**](#consumercontrollerackpendingentries) | **POST** /api/databases/{dbInstance}/streams/consumer-groups/consumers/pending-messages/ack | |
|[**consumerControllerClaimPendingEntries**](#consumercontrollerclaimpendingentries) | **POST** /api/databases/{dbInstance}/streams/consumer-groups/consumers/pending-messages/claim | |
|[**consumerControllerDeleteConsumers**](#consumercontrollerdeleteconsumers) | **DELETE** /api/databases/{dbInstance}/streams/consumer-groups/consumers | |
|[**consumerControllerGetConsumers**](#consumercontrollergetconsumers) | **POST** /api/databases/{dbInstance}/streams/consumer-groups/consumers/get | |
|[**consumerControllerGetPendingEntries**](#consumercontrollergetpendingentries) | **POST** /api/databases/{dbInstance}/streams/consumer-groups/consumers/pending-messages/get | |
|[**consumerGroupControllerCreateGroups**](#consumergroupcontrollercreategroups) | **POST** /api/databases/{dbInstance}/streams/consumer-groups | |
|[**consumerGroupControllerDeleteGroup**](#consumergroupcontrollerdeletegroup) | **DELETE** /api/databases/{dbInstance}/streams/consumer-groups | |
|[**consumerGroupControllerGetGroups**](#consumergroupcontrollergetgroups) | **POST** /api/databases/{dbInstance}/streams/consumer-groups/get | |
|[**consumerGroupControllerUpdateGroup**](#consumergroupcontrollerupdategroup) | **PATCH** /api/databases/{dbInstance}/streams/consumer-groups | |
|[**streamControllerAddEntries**](#streamcontrolleraddentries) | **POST** /api/databases/{dbInstance}/streams/entries | |
|[**streamControllerCreateStream**](#streamcontrollercreatestream) | **POST** /api/databases/{dbInstance}/streams | |
|[**streamControllerDeleteEntries**](#streamcontrollerdeleteentries) | **DELETE** /api/databases/{dbInstance}/streams/entries | |
|[**streamControllerGetEntries**](#streamcontrollergetentries) | **POST** /api/databases/{dbInstance}/streams/entries/get | |

# **consumerControllerAckPendingEntries**
> AckPendingEntriesResponse consumerControllerAckPendingEntries(ackPendingEntriesDto)

Ack pending entries

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    AckPendingEntriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let ackPendingEntriesDto: AckPendingEntriesDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerControllerAckPendingEntries(
    dbInstance,
    ackPendingEntriesDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ackPendingEntriesDto** | **AckPendingEntriesDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**AckPendingEntriesResponse**

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

# **consumerControllerClaimPendingEntries**
> ClaimPendingEntriesResponse consumerControllerClaimPendingEntries(claimPendingEntryDto)

Claim pending entries

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    ClaimPendingEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let claimPendingEntryDto: ClaimPendingEntryDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerControllerClaimPendingEntries(
    dbInstance,
    claimPendingEntryDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **claimPendingEntryDto** | **ClaimPendingEntryDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**ClaimPendingEntriesResponse**

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

# **consumerControllerDeleteConsumers**
> consumerControllerDeleteConsumers(deleteConsumersDto)

Delete Consumer(s) from the Consumer Group

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    DeleteConsumersDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let deleteConsumersDto: DeleteConsumersDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerControllerDeleteConsumers(
    dbInstance,
    deleteConsumersDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteConsumersDto** | **DeleteConsumersDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


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

# **consumerControllerGetConsumers**
> Array<ConsumerDto> consumerControllerGetConsumers(getConsumersDto)

Get consumers list in the group

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    GetConsumersDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getConsumersDto: GetConsumersDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerControllerGetConsumers(
    dbInstance,
    encoding,
    getConsumersDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getConsumersDto** | **GetConsumersDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<ConsumerDto>**

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

# **consumerControllerGetPendingEntries**
> Array<PendingEntryDto> consumerControllerGetPendingEntries(getPendingEntriesDto)

Get pending entries list

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    GetPendingEntriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getPendingEntriesDto: GetPendingEntriesDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerControllerGetPendingEntries(
    dbInstance,
    encoding,
    getPendingEntriesDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getPendingEntriesDto** | **GetPendingEntriesDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<PendingEntryDto>**

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

# **consumerGroupControllerCreateGroups**
> consumerGroupControllerCreateGroups(createConsumerGroupsDto)

Create stream consumer group

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    CreateConsumerGroupsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let createConsumerGroupsDto: CreateConsumerGroupsDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerGroupControllerCreateGroups(
    dbInstance,
    createConsumerGroupsDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createConsumerGroupsDto** | **CreateConsumerGroupsDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **consumerGroupControllerDeleteGroup**
> DeleteConsumerGroupsResponse consumerGroupControllerDeleteGroup(deleteConsumerGroupsDto)

Delete Consumer Group

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    DeleteConsumerGroupsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let deleteConsumerGroupsDto: DeleteConsumerGroupsDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerGroupControllerDeleteGroup(
    dbInstance,
    deleteConsumerGroupsDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteConsumerGroupsDto** | **DeleteConsumerGroupsDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteConsumerGroupsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns number of affected consumer groups. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **consumerGroupControllerGetGroups**
> Array<ConsumerGroupDto> consumerGroupControllerGetGroups(keyDto)

Get consumer groups list

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    KeyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let keyDto: KeyDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerGroupControllerGetGroups(
    dbInstance,
    encoding,
    keyDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **keyDto** | **KeyDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<ConsumerGroupDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns stream consumer groups. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **consumerGroupControllerUpdateGroup**
> consumerGroupControllerUpdateGroup(updateConsumerGroupDto)

Modify last delivered ID of the Consumer Group

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    UpdateConsumerGroupDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let updateConsumerGroupDto: UpdateConsumerGroupDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.consumerGroupControllerUpdateGroup(
    dbInstance,
    updateConsumerGroupDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateConsumerGroupDto** | **UpdateConsumerGroupDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


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

# **streamControllerAddEntries**
> AddStreamEntriesResponse streamControllerAddEntries(addStreamEntriesDto)

Add entries to the stream

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    AddStreamEntriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let addStreamEntriesDto: AddStreamEntriesDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.streamControllerAddEntries(
    dbInstance,
    encoding,
    addStreamEntriesDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addStreamEntriesDto** | **AddStreamEntriesDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**AddStreamEntriesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns entries IDs added |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **streamControllerCreateStream**
> streamControllerCreateStream(createStreamDto)

Create stream

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    CreateStreamDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let createStreamDto: CreateStreamDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.streamControllerCreateStream(
    dbInstance,
    createStreamDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createStreamDto** | **CreateStreamDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **streamControllerDeleteEntries**
> DeleteStreamEntriesResponse streamControllerDeleteEntries(deleteStreamEntriesDto)

Remove the specified entries from the Stream stored at key

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    DeleteStreamEntriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let deleteStreamEntriesDto: DeleteStreamEntriesDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.streamControllerDeleteEntries(
    dbInstance,
    deleteStreamEntriesDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteStreamEntriesDto** | **DeleteStreamEntriesDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**DeleteStreamEntriesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Ok |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **streamControllerGetEntries**
> GetStreamEntriesResponse streamControllerGetEntries(getStreamEntriesDto)

Get stream entries

### Example

```typescript
import {
    BrowserStreamsApi,
    Configuration,
    GetStreamEntriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BrowserStreamsApi(configuration);

let dbInstance: string; // (default to undefined)
let encoding: 'utf8' | 'ascii' | 'buffer'; // (default to undefined)
let getStreamEntriesDto: GetStreamEntriesDto; //
let riDbIndex: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.streamControllerGetEntries(
    dbInstance,
    encoding,
    getStreamEntriesDto,
    riDbIndex
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getStreamEntriesDto** | **GetStreamEntriesDto**|  | |
| **dbInstance** | [**string**] |  | defaults to undefined|
| **encoding** | [**&#39;utf8&#39; | &#39;ascii&#39; | &#39;buffer&#39;**]**Array<&#39;utf8&#39; &#124; &#39;ascii&#39; &#124; &#39;buffer&#39;>** |  | defaults to undefined|
| **riDbIndex** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GetStreamEntriesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns ordered stream entries in defined range. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

