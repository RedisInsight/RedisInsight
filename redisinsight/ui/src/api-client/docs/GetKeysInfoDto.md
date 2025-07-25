# GetKeysInfoDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keys** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | List of keys | [default to undefined]
**type** | **string** | Iterate through the database looking for keys of a specific type. | [optional] [default to undefined]
**includeSize** | **boolean** | Flag to determine if keys should be requested and shown in the response | [optional] [default to true]
**includeTTL** | **boolean** | Flag to determine if TTL should be requested and shown in the response | [optional] [default to true]

## Example

```typescript
import { GetKeysInfoDto } from './api';

const instance: GetKeysInfoDto = {
    keys,
    type,
    includeSize,
    includeTTL,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
