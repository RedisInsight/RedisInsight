# ClusterConnectionDetailsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of your Redis Enterprise. | [default to 'localhost']
**port** | **number** | The port your Redis Enterprise cluster is available on. | [default to 9443]
**username** | **string** | The admin e-mail/username | [default to undefined]
**password** | **string** | The admin password | [default to undefined]

## Example

```typescript
import { ClusterConnectionDetailsDto } from './api';

const instance: ClusterConnectionDetailsDto = {
    host,
    port,
    username,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
