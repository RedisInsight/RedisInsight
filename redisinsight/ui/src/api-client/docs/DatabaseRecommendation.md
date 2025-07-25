# DatabaseRecommendation


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Recommendation id | [default to undefined]
**name** | **string** | Recommendation name | [default to undefined]
**databaseId** | **string** | Database ID to which recommendation belongs | [default to undefined]
**read** | **boolean** | Determines if recommendation was shown to user | [optional] [default to undefined]
**disabled** | **boolean** | Should this recommendation shown to user | [optional] [default to undefined]
**vote** | **string** | Recommendation vote | [optional] [default to VoteEnum_Useful]
**hide** | **boolean** | Should this recommendation hidden | [optional] [default to undefined]
**params** | **object** | Additional recommendation params | [optional] [default to undefined]

## Example

```typescript
import { DatabaseRecommendation } from './api';

const instance: DatabaseRecommendation = {
    id,
    name,
    databaseId,
    read,
    disabled,
    vote,
    hide,
    params,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
