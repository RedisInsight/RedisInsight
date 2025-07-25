# NspSummary


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**nsp** | [**NspSummaryNsp**](NspSummaryNsp.md) |  | [default to undefined]
**memory** | **number** | Total memory used by namespace in bytes | [default to undefined]
**keys** | **number** | Total keys inside namespace | [default to undefined]
**types** | [**Array&lt;NspTypeSummary&gt;**](NspTypeSummary.md) | Top namespaces by keys number | [default to undefined]

## Example

```typescript
import { NspSummary } from './api';

const instance: NspSummary = {
    nsp,
    memory,
    keys,
    types,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
