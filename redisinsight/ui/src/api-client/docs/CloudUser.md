# CloudUser


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | User id | [optional] [default to undefined]
**name** | **string** | User name | [optional] [default to undefined]
**currentAccountId** | **number** | Current account id | [optional] [default to undefined]
**capiKey** | [**CloudCapiKey**](CloudCapiKey.md) | Cloud API key | [optional] [default to undefined]
**accounts** | [**Array&lt;CloudUserAccount&gt;**](CloudUserAccount.md) | User accounts | [optional] [default to undefined]
**data** | **object** | Additional user data | [optional] [default to undefined]

## Example

```typescript
import { CloudUser } from './api';

const instance: CloudUser = {
    id,
    name,
    currentAccountId,
    capiKey,
    accounts,
    data,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
