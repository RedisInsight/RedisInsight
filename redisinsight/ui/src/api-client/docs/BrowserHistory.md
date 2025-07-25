# BrowserHistory


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | History id | [default to '76dd5654-814b-4e49-9c72-b236f50891f4']
**databaseId** | **string** | Database id | [default to '76dd5654-814b-4e49-9c72-b236f50891f4']
**filter** | [**ScanFilter**](ScanFilter.md) | Filters for scan operation | [default to undefined]
**mode** | **string** | Mode of history | [default to ModeEnum_Pattern]
**createdAt** | **string** | History created date (ISO string) | [default to 2022-09-16T06:29:20Z]

## Example

```typescript
import { BrowserHistory } from './api';

const instance: BrowserHistory = {
    id,
    databaseId,
    filter,
    mode,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
