# CloudDatabaseDetails


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cloudId** | **number** | Database id from the cloud | [default to undefined]
**subscriptionId** | **number** | Subscription id from the cloud | [default to undefined]
**subscriptionType** | **string** | Subscription type | [default to undefined]
**planMemoryLimit** | **number** | Plan memory limit | [optional] [default to undefined]
**memoryLimitMeasurementUnit** | **string** | Memory limit units | [optional] [default to undefined]
**free** | **boolean** | Is free database | [optional] [default to undefined]
**isBdbPackage** | **boolean** | Is subscription using bdb packages | [optional] [default to undefined]

## Example

```typescript
import { CloudDatabaseDetails } from './api';

const instance: CloudDatabaseDetails = {
    cloudId,
    subscriptionId,
    subscriptionType,
    planMemoryLimit,
    memoryLimitMeasurementUnit,
    free,
    isBdbPackage,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
