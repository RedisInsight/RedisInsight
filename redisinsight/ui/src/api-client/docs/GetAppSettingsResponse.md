# GetAppSettingsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**theme** | **string** | Applied application theme. | [default to undefined]
**dateFormat** | **string** | Applied application date format | [default to undefined]
**timezone** | **string** | Applied application timezone | [default to undefined]
**scanThreshold** | **number** | Applied the threshold for scan operation. | [default to undefined]
**batchSize** | **number** | Applied the batch of the commands for workbench. | [default to undefined]
**acceptTermsAndConditionsOverwritten** | **boolean** | Flag indicating that terms and conditions are accepted via environment variable | [default to undefined]
**agreements** | [**GetUserAgreementsResponse**](GetUserAgreementsResponse.md) | Agreements set by the user. | [default to undefined]

## Example

```typescript
import { GetAppSettingsResponse } from './api';

const instance: GetAppSettingsResponse = {
    theme,
    dateFormat,
    timezone,
    scanThreshold,
    batchSize,
    acceptTermsAndConditionsOverwritten,
    agreements,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
