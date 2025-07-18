# SendEventDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | **string** | Telemetry event name. | [default to undefined]
**eventData** | **object** | Telemetry event data. | [optional] [default to undefined]
**nonTracking** | **boolean** | Does not track the specific user in any way? | [optional] [default to undefined]
**traits** | **object** | User data. | [optional] [default to undefined]

## Example

```typescript
import { SendEventDto } from './api';

const instance: SendEventDto = {
    event,
    eventData,
    nonTracking,
    traits,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
