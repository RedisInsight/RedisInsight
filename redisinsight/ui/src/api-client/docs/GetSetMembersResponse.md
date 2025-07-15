# GetSetMembersResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**PushListElementsResponseKeyName**](PushListElementsResponseKeyName.md) |  | [default to undefined]
**nextCursor** | **number** | The new cursor to use in the next call. If the property has value of 0, then the iteration is completed. | [default to undefined]
**members** | [**Array&lt;CreateListWithExpireDtoElementsInner&gt;**](CreateListWithExpireDtoElementsInner.md) | Array of members | [default to undefined]
**total** | **number** | The number of members in the currently-selected set. | [default to undefined]

## Example

```typescript
import { GetSetMembersResponse } from './api';

const instance: GetSetMembersResponse = {
    keyName,
    nextCursor,
    members,
    total,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
