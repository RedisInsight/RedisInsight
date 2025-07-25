# CreateCloudJobDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Job name to create | [default to undefined]
**runMode** | **string** | Mod in which to run the job. | [default to undefined]
**data** | [**CreateCloudJobDtoData**](CreateCloudJobDtoData.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CreateCloudJobDto } from './api';

const instance: CreateCloudJobDto = {
    name,
    runMode,
    data,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
