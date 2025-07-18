# DatabaseAnalysis


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Analysis id | [default to '76dd5654-814b-4e49-9c72-b236f50891f4']
**databaseId** | **string** | Database id | [default to '76dd5654-814b-4e49-9c72-b236f50891f4']
**filter** | [**ScanFilter**](ScanFilter.md) | Filters for scan operation | [default to undefined]
**delimiter** | **string** | Namespace delimiter | [default to ':']
**progress** | [**AnalysisProgress**](AnalysisProgress.md) | Analysis progress | [default to undefined]
**createdAt** | **string** | Analysis created date (ISO string) | [default to 2022-09-16T06:29:20Z]
**totalKeys** | [**SimpleSummary**](SimpleSummary.md) | Total keys with details by types | [default to undefined]
**totalMemory** | [**SimpleSummary**](SimpleSummary.md) | Total memory with details by types | [default to undefined]
**topKeysNsp** | [**Array&lt;NspSummary&gt;**](NspSummary.md) | Top namespaces by keys number | [default to undefined]
**topMemoryNsp** | [**Array&lt;NspSummary&gt;**](NspSummary.md) | Top namespaces by memory | [default to undefined]
**topKeysLength** | [**Array&lt;Key&gt;**](Key.md) | Top keys by key length (string length, list elements count, etc.) | [default to undefined]
**topKeysMemory** | [**Array&lt;Key&gt;**](Key.md) | Top keys by memory used | [default to undefined]
**expirationGroups** | [**Array&lt;SumGroup&gt;**](SumGroup.md) | Expiration groups | [default to undefined]
**recommendations** | [**Array&lt;Recommendation&gt;**](Recommendation.md) | Recommendations | [default to undefined]
**db** | **number** | Logical database number. | [optional] [default to undefined]

## Example

```typescript
import { DatabaseAnalysis } from './api';

const instance: DatabaseAnalysis = {
    id,
    databaseId,
    filter,
    delimiter,
    progress,
    createdAt,
    totalKeys,
    totalMemory,
    topKeysNsp,
    topMemoryNsp,
    topKeysLength,
    topKeysMemory,
    expirationGroups,
    recommendations,
    db,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
