# CreateBasicSshOptionsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of SSH server | [default to 'localhost']
**port** | **number** | The port of SSH server | [default to 22]
**username** | **string** | SSH username | [optional] [default to undefined]
**password** | **string** | The SSH password | [optional] [default to undefined]

## Example

```typescript
import { CreateBasicSshOptionsDto } from './api';

const instance: CreateBasicSshOptionsDto = {
    host,
    port,
    username,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
