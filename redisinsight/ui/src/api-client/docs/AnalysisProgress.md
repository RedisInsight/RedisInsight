# AnalysisProgress


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **number** | Total keys in the database | [default to undefined]
**scanned** | **number** | Total keys scanned for entire database | [default to undefined]
**processed** | **number** | Total keys processed for entire database. (Filtered keys returned by scan command) | [default to undefined]

## Example

```typescript
import { AnalysisProgress } from './api';

const instance: AnalysisProgress = {
    total,
    scanned,
    processed,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
