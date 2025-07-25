# GetKeysWithDetailsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cursor** | **number** | The new cursor to use in the next call. If the property has value of 0, then the iteration is completed. | [default to 0]
**total** | **number** | The number of keys in the currently-selected database. | [default to undefined]
**scanned** | **number** | The number of keys we tried to scan. Be aware that scanned is sum of COUNT parameters from redis commands | [default to undefined]
**keys** | [**Array&lt;GetKeyInfoResponse&gt;**](GetKeyInfoResponse.md) | Array of Keys. | [default to undefined]
**host** | **string** | Node host. In case when we are working with cluster | [optional] [default to undefined]
**port** | **number** | Node port. In case when we are working with cluster | [optional] [default to undefined]
**maxResults** | **number** | The maximum number of results. For RediSearch this number is a value from \&quot;FT.CONFIG GET maxsearchresults\&quot; command. | [optional] [default to undefined]

## Example

```typescript
import { GetKeysWithDetailsResponse } from './api';

const instance: GetKeysWithDetailsResponse = {
    cursor,
    total,
    scanned,
    keys,
    host,
    port,
    maxResults,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
