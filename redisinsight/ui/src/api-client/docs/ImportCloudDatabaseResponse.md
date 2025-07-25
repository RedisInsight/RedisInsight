# ImportCloudDatabaseResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**subscriptionId** | **number** | Subscription id | [default to undefined]
**databaseId** | **number** | Database id | [default to undefined]
**status** | **string** | Add Redis Cloud database status | [default to StatusEnum_Success]
**message** | **string** | Message | [default to undefined]
**databaseDetails** | [**CloudDatabase**](CloudDatabase.md) | The database details. | [optional] [default to undefined]
**error** | **object** | Error | [optional] [default to undefined]

## Example

```typescript
import { ImportCloudDatabaseResponse } from './api';

const instance: ImportCloudDatabaseResponse = {
    subscriptionId,
    databaseId,
    status,
    message,
    databaseDetails,
    error,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
