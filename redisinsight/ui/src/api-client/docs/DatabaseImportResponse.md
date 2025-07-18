# DatabaseImportResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **number** | Total elements processed from the import file | [default to undefined]
**success** | [**DatabaseImportResult**](DatabaseImportResult.md) | List of successfully imported database | [default to undefined]
**partial** | [**DatabaseImportResult**](DatabaseImportResult.md) | List of partially imported database | [default to undefined]
**fail** | [**DatabaseImportResult**](DatabaseImportResult.md) | List of databases failed to import | [default to undefined]

## Example

```typescript
import { DatabaseImportResponse } from './api';

const instance: DatabaseImportResponse = {
    total,
    success,
    partial,
    fail,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
