# PluginState


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**visualizationId** | **string** | Plugin visualization id. Should be unique per all plugins | [default to undefined]
**commandExecutionId** | **string** | Command Execution id | [default to undefined]
**state** | **string** | Stored state | [default to undefined]
**createdAt** | **string** | Date of creation | [default to undefined]
**updatedAt** | **string** | Date of updating | [default to undefined]

## Example

```typescript
import { PluginState } from './api';

const instance: PluginState = {
    visualizationId,
    commandExecutionId,
    state,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
