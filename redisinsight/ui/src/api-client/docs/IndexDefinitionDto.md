# IndexDefinitionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key_type** | **string** | key_type, hash or JSON | [default to undefined]
**prefixes** | **Array&lt;string&gt;** | Index prefixes given during create | [default to undefined]
**default_score** | **string** | Index default_score | [default to undefined]

## Example

```typescript
import { IndexDefinitionDto } from './api';

const instance: IndexDefinitionDto = {
    key_type,
    prefixes,
    default_score,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
