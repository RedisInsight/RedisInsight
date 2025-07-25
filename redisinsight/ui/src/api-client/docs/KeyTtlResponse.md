# KeyTtlResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ttl** | **number** | The remaining time to live of a key that has a timeout. If value equals -2 then the key does not exist or has deleted. If value equals -1 then the key has no associated expire (No limit). | [default to undefined]

## Example

```typescript
import { KeyTtlResponse } from './api';

const instance: KeyTtlResponse = {
    ttl,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
