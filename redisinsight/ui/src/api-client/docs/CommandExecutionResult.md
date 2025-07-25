# CommandExecutionResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Redis CLI command execution status | [default to StatusEnum_Success]
**response** | **string** | Redis response | [default to undefined]
**sizeLimitExceeded** | **boolean** | Flag showing if response was replaced with message notification about response size limit threshold | [default to undefined]

## Example

```typescript
import { CommandExecutionResult } from './api';

const instance: CommandExecutionResult = {
    status,
    response,
    sizeLimitExceeded,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
