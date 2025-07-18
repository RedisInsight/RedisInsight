# GetListElementsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**PushListElementsResponseKeyName**](PushListElementsResponseKeyName.md) |  | [default to undefined]
**total** | **number** | The number of elements in the currently-selected list. | [default to undefined]
**elements** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | Elements | [default to undefined]

## Example

```typescript
import { GetListElementsResponse } from './api';

const instance: GetListElementsResponse = {
    keyName,
    total,
    elements,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
