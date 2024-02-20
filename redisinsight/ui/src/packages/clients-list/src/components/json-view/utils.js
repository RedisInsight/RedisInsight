export var isBigInt = function (data) { return typeof data === 'bigint' || data instanceof BigInt; };
export var isArray = function (data) { return Array.isArray(data); };
export var isObject = function (data) { return typeof data === 'object'
    && data !== null
    && !Array.isArray(data); };
//# sourceMappingURL=utils.js.map