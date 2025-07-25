# CaCertificate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Certificate id | [default to undefined]
**name** | **string** | Certificate name | [default to undefined]
**certificate** | **string** | Certificate body | [default to undefined]
**isPreSetup** | **boolean** | Whether the certificate was created from a file or environment variables at startup | [optional] [default to undefined]

## Example

```typescript
import { CaCertificate } from './api';

const instance: CaCertificate = {
    id,
    name,
    certificate,
    isPreSetup,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
