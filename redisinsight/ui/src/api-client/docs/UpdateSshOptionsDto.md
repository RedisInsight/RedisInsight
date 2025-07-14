# UpdateSshOptionsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of SSH server | [optional] [default to 'localhost']
**port** | **number** | The port of SSH server | [optional] [default to 22]
**username** | **string** | SSH username | [optional] [default to undefined]
**password** | **string** | The SSH password | [optional] [default to undefined]
**privateKey** | **string** | The SSH private key | [optional] [default to undefined]
**passphrase** | **string** | The SSH passphrase | [optional] [default to undefined]

## Example

```typescript
import { UpdateSshOptionsDto } from './api';

const instance: UpdateSshOptionsDto = {
    host,
    port,
    username,
    password,
    privateKey,
    passphrase,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
