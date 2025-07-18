# CloudSubscriptionPlanResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**regionId** | **number** |  | [default to undefined]
**type** | **string** | Subscription type | [default to undefined]
**name** | **string** |  | [default to undefined]
**provider** | **string** |  | [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**price** | **number** |  | [optional] [default to undefined]
**details** | [**CloudSubscriptionRegion**](CloudSubscriptionRegion.md) |  | [default to undefined]

## Example

```typescript
import { CloudSubscriptionPlanResponse } from './api';

const instance: CloudSubscriptionPlanResponse = {
    id,
    regionId,
    type,
    name,
    provider,
    region,
    price,
    details,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
