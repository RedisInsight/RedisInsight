# CreateDatabaseDtoClientCert

Client Certificate

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Certificate name | [default to undefined]
**certificate** | **string** | Certificate body | [default to undefined]
**key** | **string** | Key body | [default to undefined]
**isPreSetup** | **boolean** | Whether the certificate was created from a file or environment variables at startup | [optional] [default to undefined]
**id** | **string** | Certificate id | [default to undefined]

## Example

```typescript
import { CreateDatabaseDtoClientCert } from './api';

const instance: CreateDatabaseDtoClientCert = {
    name,
    certificate,
    key,
    isPreSetup,
    id,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
