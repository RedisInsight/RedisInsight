# CreateCloudJobDtoData

Any data for create a job.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**subscriptionId** | **number** | Subscription id of database | [default to undefined]
**planId** | **number** | Plan id for create a subscription. | [default to undefined]
**isRecommendedSettings** | **boolean** | Use recommended settings | [optional] [default to undefined]
**databaseId** | **number** | Database id to import | [default to undefined]
**region** | **string** | Subscription region | [default to undefined]
**provider** | **string** | Subscription provider | [default to undefined]

## Example

```typescript
import { CreateCloudJobDtoData } from './api';

const instance: CreateCloudJobDtoData = {
    subscriptionId,
    planId,
    isRecommendedSettings,
    databaseId,
    region,
    provider,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
