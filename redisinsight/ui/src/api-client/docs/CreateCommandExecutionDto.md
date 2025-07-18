# CreateCommandExecutionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**command** | **string** | Redis command | [default to undefined]
**mode** | **string** | Workbench mode | [optional] [default to ModeEnum_Ascii]
**resultsMode** | **string** | Workbench result mode | [optional] [default to ResultsModeEnum_Default]
**type** | **string** | Command execution type. Used to distinguish between search and workbench | [optional] [default to TypeEnum_Workbench]

## Example

```typescript
import { CreateCommandExecutionDto } from './api';

const instance: CreateCommandExecutionDto = {
    command,
    mode,
    resultsMode,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
