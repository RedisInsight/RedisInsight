# CreateSetWithExpireDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | **string** | Key Name | [default to undefined]
**members** | **Array&lt;string&gt;** | Set members | [default to undefined]
**expire** | **number** | Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted. | [optional] [default to undefined]

## Example

```typescript
import { CreateSetWithExpireDto } from './api';

const instance: CreateSetWithExpireDto = {
    keyName,
    members,
    expire,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
