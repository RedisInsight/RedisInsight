# DeleteConsumersDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**CreateListWithExpireDtoKeyName**](CreateListWithExpireDtoKeyName.md) |  | [default to undefined]
**groupName** | [**GetConsumersDtoGroupName**](GetConsumersDtoGroupName.md) |  | [default to undefined]
**consumerNames** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | Names of consumers to delete | [default to undefined]

## Example

```typescript
import { DeleteConsumersDto } from './api';

const instance: DeleteConsumersDto = {
    keyName,
    groupName,
    consumerNames,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
