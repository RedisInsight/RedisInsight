# CommandExecution


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Command execution id | [default to undefined]
**databaseId** | **string** | Database id | [default to undefined]
**command** | **string** | Redis command | [default to undefined]
**mode** | **string** | Workbench mode | [optional] [default to ModeEnum_Ascii]
**resultsMode** | **string** | Workbench result mode | [optional] [default to ResultsModeEnum_Default]
**summary** | [**ResultsSummary**](ResultsSummary.md) | Workbench executions summary | [optional] [default to undefined]
**result** | [**Array&lt;CommandExecutionResult&gt;**](CommandExecutionResult.md) | Command execution result | [default to undefined]
**isNotStored** | **boolean** | Result did not stored in db | [optional] [default to undefined]
**createdAt** | **string** | Date of command execution | [default to undefined]
**executionTime** | **number** | Workbench command execution time | [optional] [default to undefined]
**db** | **number** | Logical database number. | [optional] [default to undefined]
**type** | **string** | Command execution type. Used to distinguish between search and workbench | [optional] [default to TypeEnum_Workbench]

## Example

```typescript
import { CommandExecution } from './api';

const instance: CommandExecution = {
    id,
    databaseId,
    command,
    mode,
    resultsMode,
    summary,
    result,
    isNotStored,
    createdAt,
    executionTime,
    db,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
