import React, { Fragment } from 'react';
import JsonPretty from '../json-pretty';
var JsonArray = function (_a) {
    var data = _a.data, _b = _a.space, space = _b === void 0 ? 2 : _b, _c = _a.gap, gap = _c === void 0 ? 0 : _c, _d = _a.lastElement, lastElement = _d === void 0 ? true : _d;
    return (React.createElement("span", { "data-testid": "json-array-component" },
        "[",
        !!data.length && '\n',
        data.map(function (value, idx) { return (
        // eslint-disable-next-line react/no-array-index-key
        React.createElement(Fragment, { key: "".concat(idx) },
            !!space && Array.from({ length: space + gap }, function () { return ' '; }),
            React.createElement(JsonPretty, { data: value, lastElement: idx === data.length - 1, space: space, gap: gap + space }))); }),
        !!data.length && !!gap && Array.from({ length: gap }, function () { return ' '; }),
        "]",
        !lastElement && ',',
        '\n'));
};
export default JsonArray;
//# sourceMappingURL=JsonArray.js.map