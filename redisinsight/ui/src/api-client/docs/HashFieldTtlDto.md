# HashFieldTtlDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**field** | [**HashFieldDtoField**](HashFieldDtoField.md) |  | [default to undefined]
**expire** | **number** | Set a timeout on key in seconds. After the timeout has expired, the field will automatically be deleted. If the property has value of -1, then the field timeout will be removed. | [default to undefined]

## Example

```typescript
import { HashFieldTtlDto } from './api';

const instance: HashFieldTtlDto = {
    field,
    expire,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
