# CloudAuthRequestOptions


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**strategy** | **string** | OAuth identity provider strategy | [default to undefined]
**action** | **string** | Action to perform after authentication | [optional] [default to undefined]
**data** | **object** | Additional data for the authentication request | [optional] [default to undefined]
**callback** | **object** | Callback function to execute after authentication | [optional] [default to undefined]

## Example

```typescript
import { CloudAuthRequestOptions } from './api';

const instance: CloudAuthRequestOptions = {
    strategy,
    action,
    data,
    callback,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
