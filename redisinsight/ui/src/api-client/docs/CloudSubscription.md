# CloudSubscription


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Subscription id | [default to undefined]
**name** | **string** | Subscription name | [default to undefined]
**type** | **string** | Subscription type | [default to undefined]
**numberOfDatabases** | **number** | Number of databases in subscription | [default to undefined]
**status** | **string** | Subscription status | [default to StatusEnum_Active]
**provider** | **string** | Subscription provider | [optional] [default to undefined]
**region** | **string** | Subscription region | [optional] [default to undefined]
**price** | **number** | Subscription price | [optional] [default to undefined]
**free** | **boolean** | Determines if subscription is 0 price | [optional] [default to undefined]

## Example

```typescript
import { CloudSubscription } from './api';

const instance: CloudSubscription = {
    id,
    name,
    type,
    numberOfDatabases,
    status,
    provider,
    region,
    price,
    free,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
