# GetServerInfoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Server identifier. | [default to undefined]
**createDateTime** | **string** | Time of the first server launch. | [default to undefined]
**appVersion** | **string** | Version of the application. | [default to undefined]
**osPlatform** | **string** | The operating system platform. | [default to undefined]
**buildType** | **string** | Application build type. | [default to undefined]
**packageType** | **string** | Application package type. | [default to undefined]
**appType** | **string** | Application type. | [default to undefined]
**fixedDatabaseId** | **string** | Fixed Redis database id. | [optional] [default to undefined]
**encryptionStrategies** | **Array&lt;string&gt;** | List of available encryption strategies | [default to undefined]
**sessionId** | **number** | Server session id. | [default to undefined]

## Example

```typescript
import { GetServerInfoResponse } from './api';

const instance: GetServerInfoResponse = {
    id,
    createDateTime,
    appVersion,
    osPlatform,
    buildType,
    packageType,
    appType,
    fixedDatabaseId,
    encryptionStrategies,
    sessionId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
