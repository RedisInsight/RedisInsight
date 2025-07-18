# GetZSetResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**PushListElementsResponseKeyName**](PushListElementsResponseKeyName.md) |  | [default to undefined]
**total** | **number** | The number of members in the currently-selected z-set. | [default to undefined]
**members** | [**Array&lt;ZSetMemberDto&gt;**](ZSetMemberDto.md) | Array of Members. | [default to undefined]

## Example

```typescript
import { GetZSetResponse } from './api';

const instance: GetZSetResponse = {
    keyName,
    total,
    members,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
