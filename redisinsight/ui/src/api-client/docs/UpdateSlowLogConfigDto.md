# UpdateSlowLogConfigDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slowlogMaxLen** | **number** | Max logs to store inside Redis slowlog | [optional] [default to undefined]
**slowlogLogSlowerThan** | **number** | Store logs with execution time greater than this value (in microseconds) | [optional] [default to undefined]

## Example

```typescript
import { UpdateSlowLogConfigDto } from './api';

const instance: UpdateSlowLogConfigDto = {
    slowlogMaxLen,
    slowlogLogSlowerThan,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
