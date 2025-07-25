# CreateCommandExecutionsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mode** | **string** | Workbench mode | [optional] [default to ModeEnum_Ascii]
**resultsMode** | **string** | Workbench result mode | [optional] [default to ResultsModeEnum_Default]
**type** | **string** | Command execution type. Used to distinguish between search and workbench | [optional] [default to TypeEnum_Workbench]
**commands** | **Array&lt;string&gt;** | Redis commands | [default to undefined]

## Example

```typescript
import { CreateCommandExecutionsDto } from './api';

const instance: CreateCommandExecutionsDto = {
    mode,
    resultsMode,
    type,
    commands,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
