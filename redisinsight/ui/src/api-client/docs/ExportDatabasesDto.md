# ExportDatabasesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ids** | **Array&lt;string&gt;** | The unique IDs of the databases requested | [default to undefined]
**withSecrets** | **boolean** | Export passwords and certificate bodies | [optional] [default to undefined]

## Example

```typescript
import { ExportDatabasesDto } from './api';

const instance: ExportDatabasesDto = {
    ids,
    withSecrets,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
