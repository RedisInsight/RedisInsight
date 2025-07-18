# GetHashFieldsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyName** | [**PushListElementsResponseKeyName**](PushListElementsResponseKeyName.md) |  | [default to undefined]
**nextCursor** | **number** | The new cursor to use in the next call. If the property has value of 0, then the iteration is completed. | [default to undefined]
**fields** | [**Array&lt;HashFieldDto&gt;**](HashFieldDto.md) | Array of members. | [default to undefined]
**total** | **number** | The number of fields in the currently-selected hash. | [default to undefined]

## Example

```typescript
import { GetHashFieldsResponse } from './api';

const instance: GetHashFieldsResponse = {
    keyName,
    nextCursor,
    fields,
    total,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
