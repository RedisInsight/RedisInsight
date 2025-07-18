# Endpoint


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**host** | **string** | The hostname of your Redis database, for example redis.acme.com. If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost. | [default to 'localhost']
**port** | **number** | The port your Redis database is available on. | [default to 6379]

## Example

```typescript
import { Endpoint } from './api';

const instance: Endpoint = {
    host,
    port,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
