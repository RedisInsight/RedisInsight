# ConsumerDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | [**ConsumerDtoName**](ConsumerDtoName.md) |  | [default to undefined]
**pending** | **number** | The number of pending messages for the client, which are messages that were delivered but are yet to be acknowledged | [default to undefined]
**idle** | **number** | The number of milliseconds that have passed since the consumer last interacted with the server | [default to undefined]

## Example

```typescript
import { ConsumerDto } from './api';

const instance: ConsumerDto = {
    name,
    pending,
    idle,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
