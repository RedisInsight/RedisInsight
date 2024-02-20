import React, { Fragment } from 'react';
import JsonPretty from '../json-pretty';
var JsonObject = function (_a) {
    var data = _a.data, _b = _a.space, space = _b === void 0 ? 2 : _b, _c = _a.gap, gap = _c === void 0 ? 0 : _c, _d = _a.lastElement, lastElement = _d === void 0 ? true : _d;
    var keys = Object.keys(data);
    return (React.createElement("span", { "data-testid": "json-object-component" },
        '{',
        !!keys.length && '\n',
        keys.map(function (key, idx) { return (React.createElement(Fragment, { key: "".concat(key, "-{idx}") },
            !!space && Array.from({ length: space + gap }, function () { return ' '; }),
            React.createElement("span", { className: "json-pretty__key" }, "\"".concat(key, "\"")),
            ': ',
            React.createElement(JsonPretty, { data: data[key], lastElement: idx === Object.keys(data).length - 1, space: space, gap: gap + space }))); }),
        !!keys.length && !!gap && Array.from({ length: gap }, function () { return ' '; }),
        '}',
        !lastElement && ',',
        '\n'));
};
export default JsonObject;
//# sourceMappingURL=JsonObject.js.map