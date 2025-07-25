# SshOptionsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of SSH server | [default to 'localhost']
**port** | **number** | The port of SSH server | [default to 22]
**username** | **string** | SSH username | [optional] [default to undefined]
**password** | **boolean** | The SSH password flag (true if password was set) | [optional] [default to undefined]
**passphrase** | **boolean** | The SSH passphrase flag (true if password was set) | [optional] [default to undefined]
**privateKey** | **boolean** | The SSH private key | [optional] [default to undefined]

## Example

```typescript
import { SshOptionsResponse } from './api';

const instance: SshOptionsResponse = {
    host,
    port,
    username,
    password,
    passphrase,
    privateKey,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
