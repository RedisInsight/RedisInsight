# SafeRejsonRlDataDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key** | **string** | Key inside json data | [default to undefined]
**path** | **string** | Path of the json field | [default to undefined]
**cardinality** | **number** | Number of properties/elements inside field (for object and arrays only) | [optional] [default to undefined]
**type** | **string** | Type of the field | [default to undefined]
**value** | **string** | Any value | [optional] [default to undefined]

## Example

```typescript
import { SafeRejsonRlDataDto } from './api';

const instance: SafeRejsonRlDataDto = {
    key,
    path,
    cardinality,
    type,
    value,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
