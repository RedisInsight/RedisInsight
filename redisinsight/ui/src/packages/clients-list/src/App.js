/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { JSONView, TableView } from './components';
import { cachedIcons, parseClientListResponse, parseJSONASCIIResponse, } from './utils';
export var CommonPlugin;
(function (CommonPlugin) {
    CommonPlugin["ClientList"] = "ClientList";
    CommonPlugin["JSON"] = "JSON";
})(CommonPlugin || (CommonPlugin = {}));
export var RawMode;
(function (RawMode) {
    RawMode["RAW"] = "RAW";
    RawMode["ASCII"] = "ASCII";
})(RawMode || (RawMode = {}));
// This is problematic for some bundlers and/or deployments,
// so a method exists to preload specific icons an application needs.
appendIconComponentCache(cachedIcons);
var getJsonResultString = function (result, mode) {
    return (mode !== RawMode.RAW && result !== null
        ? parseJSONASCIIResponse(result)
        : result);
};
var getJsonResultStringFromArr = function (response, mode) {
    return "[".concat(response.map(function (result) { return getJsonResultString(result, mode); }).join(','), "]");
};
var App = function (props) {
    var _a = props.command, command = _a === void 0 ? '' : _a, _b = props.result, _c = _b === void 0 ? [] : _b, _d = _c[0], _e = _d === void 0 ? {} : _d, _f = _e.response, response = _f === void 0 ? '' : _f, _g = _e.status, status = _g === void 0 ? '' : _g, plugin = props.plugin, mode = props.mode;
    if (status === 'fail') {
        return (React.createElement("div", { className: "cli-container" },
            React.createElement("div", { className: "cli-output-response-fail" }, JSON.stringify(response))));
    }
    switch (plugin) {
        case CommonPlugin.ClientList:
            var clientResult = parseClientListResponse(response);
            return React.createElement(TableView, { query: command, result: clientResult });
        case CommonPlugin.JSON:
        default:
            var jsonResultString = Array.isArray(response)
                ? getJsonResultStringFromArr(response, mode)
                : getJsonResultString(response, mode);
            return (React.createElement("div", { className: "cli-container" },
                React.createElement(JSONView, { value: jsonResultString, command: command })));
    }
};
export default App;
//# sourceMappingURL=App.js.map