# UpdateSettingsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**theme** | **string** | Application theme. | [optional] [default to undefined]
**dateFormat** | **string** | Application date format. | [optional] [default to undefined]
**timezone** | **string** | Application timezone. | [optional] [default to undefined]
**scanThreshold** | **number** | Threshold for scan operation. | [optional] [default to undefined]
**batchSize** | **number** | Batch for workbench pipeline. | [optional] [default to undefined]
**agreements** | **object** | Agreements | [optional] [default to undefined]
**analyticsReason** | **string** | Reason describing why analytics are enabled | [optional] [default to undefined]

## Example

```typescript
import { UpdateSettingsDto } from './api';

const instance: UpdateSettingsDto = {
    theme,
    dateFormat,
    timezone,
    scanThreshold,
    batchSize,
    agreements,
    analyticsReason,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
