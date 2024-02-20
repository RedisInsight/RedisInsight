import React from 'react';
import { isString, isBoolean, isNull, isNumber } from 'lodash';
import { isBigInt } from '../../utils';
var JsonPrimitive = function (_a) {
    var data = _a.data, _b = _a.lastElement, lastElement = _b === void 0 ? true : _b;
    var stringValue = data;
    var valueStyle = 'json-pretty__other_value';
    if (isNull(data)) {
        stringValue = 'null';
        valueStyle = 'json-pretty__null-value';
    }
    else if (isString(data)) {
        stringValue = "\"".concat(data, "\"");
        valueStyle = 'json-pretty__string-value';
    }
    else if (isBoolean(data)) {
        stringValue = data ? 'true' : 'false';
        valueStyle = 'json-pretty__boolean-value';
    }
    else if (isNumber(data)) {
        stringValue = data.toString();
        valueStyle = 'json-pretty__number-value';
    }
    else if (isBigInt(data)) {
        stringValue = data.toString();
        valueStyle = 'json-pretty__bigint-value';
    }
    else {
        stringValue = data.toString();
    }
    return (React.createElement("span", { "data-testid": "json-primitive-component" },
        React.createElement("span", { className: valueStyle, "data-testid": "json-primitive-value" }, stringValue),
        !lastElement && ',',
        '\n'));
};
export default JsonPrimitive;
//# sourceMappingURL=JsonPrimitive.js.map