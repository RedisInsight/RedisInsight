# Rdi


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | RDI id. | [default to undefined]
**url** | **string** | Base url of API to connect to (for API type only) | [optional] [default to undefined]
**name** | **string** | A name to associate with RDI | [default to undefined]
**username** | **string** | RDI or API username | [optional] [default to undefined]
**password** | **string** | RDI or API password | [optional] [default to undefined]
**lastConnection** | **string** | Time of the last connection to RDI. | [default to undefined]
**version** | **string** | The version of RDI being used | [optional] [default to undefined]

## Example

```typescript
import { Rdi } from './api';

const instance: Rdi = {
    id,
    url,
    name,
    username,
    password,
    lastConnection,
    version,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
