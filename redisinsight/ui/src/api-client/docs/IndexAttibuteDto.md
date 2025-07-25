# IndexAttibuteDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**identifier** | **string** | Field identifier | [default to undefined]
**attribute** | **string** | Field attribute | [default to undefined]
**type** | **string** | Field type | [default to undefined]
**WEIGHT** | **string** | Field weight | [default to undefined]
**SORTABLE** | **boolean** | Field can be sorted | [default to undefined]
**NOINDEX** | **boolean** | Attributes can have the NOINDEX option, which means they will not be indexed.  | [default to undefined]
**CASESENSITIVE** | **boolean** | Attribute is case sensitive | [default to undefined]
**UNF** | **boolean** | By default, for hashes (not with JSON) SORTABLE applies a normalization to the indexed value       (characters set to lowercase, removal of diacritics). | [default to undefined]
**NOSTEM** | **boolean** | Text attributes can have the NOSTEM argument that disables stemming when indexing its values.       This may be ideal for things like proper names. | [default to undefined]
**SEPARATOR** | **string** | Indicates how the text contained in the attribute is to be split into individual tags.       The default is ,. The value must be a single character. | [default to undefined]

## Example

```typescript
import { IndexAttibuteDto } from './api';

const instance: IndexAttibuteDto = {
    identifier,
    attribute,
    type,
    WEIGHT,
    SORTABLE,
    NOINDEX,
    CASESENSITIVE,
    UNF,
    NOSTEM,
    SEPARATOR,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
