# IndexOptionsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**filter** | **string** | is a filter expression with the full RediSearch aggregation expression language. | [default to undefined]
**default_lang** | **string** | if set, indicates the default language for documents in the index. Default is English. | [default to undefined]

## Example

```typescript
import { IndexOptionsDto } from './api';

const instance: IndexOptionsDto = {
    filter,
    default_lang,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
