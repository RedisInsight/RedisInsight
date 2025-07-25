# Plugin


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**internal** | **boolean** | Determine if plugin is built into Redisinsight | [optional] [default to undefined]
**name** | **string** | Module name from manifest | [default to undefined]
**baseUrl** | **string** | Plugins base url | [default to undefined]
**main** | **string** | Uri to main js file on the local server | [default to undefined]
**styles** | **string** | Uri to css file on the local server | [default to undefined]
**visualizations** | [**Array&lt;PluginVisualization&gt;**](PluginVisualization.md) | Visualization field from manifest | [default to undefined]

## Example

```typescript
import { Plugin } from './api';

const instance: Plugin = {
    internal,
    name,
    baseUrl,
    main,
    styles,
    visualizations,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
