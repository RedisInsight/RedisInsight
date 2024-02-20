var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { isArray, isObject } from '../../utils';
import JsonPrimitive from '../json-primitive';
import JsonArray from '../json-array';
import JsonObject from '../json-object';
var JsonPretty = function (_a) {
    var data = _a.data, props = __rest(_a, ["data"]);
    if (isArray(data)) {
        return React.createElement(JsonArray, __assign({ data: data }, props));
    }
    if (isObject(data)) {
        return React.createElement(JsonObject, __assign({ data: data }, props));
    }
    return React.createElement(JsonPrimitive, __assign({ data: data }, props));
};
export default JsonPretty;
//# sourceMappingURL=JsonPretty.js.map