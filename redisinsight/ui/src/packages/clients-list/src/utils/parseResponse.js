import { Buffer } from '../../node_modules/buffer/index';
export var parseClientListResponse = function (response) { return response.split(/\r?\n/).filter(function (r) { return r; }).map(function (row) {
    var value = row.split(' ');
    var obj = {};
    value.forEach(function (v) {
        var pair = v.split('=');
        // eslint-disable-next-line prefer-destructuring
        obj[pair[0]] = pair[1];
    });
    return obj;
}); };
export var parseJSONASCIIResponse = function (response) {
    return getBufferFromSafeASCIIString(response).toString();
};
export var getBufferFromSafeASCIIString = function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i += 1) {
        if (str[i] === '\\') {
            if (str[i + 1] === 'x') {
                var hexString = str.substr(i + 2, 2);
                if (isHex(hexString)) {
                    bytes.push(Buffer.from(hexString, 'hex'));
                    i += 3;
                    // eslint-disable-next-line no-continue
                    continue;
                }
            }
            if (['a', '"', '\\', 'b', 't', 'n', 'r'].includes(str[i + 1])) {
                switch (str[i + 1]) {
                    case 'a':
                        bytes.push(Buffer.from('\u0007'));
                        break;
                    case 'b':
                        bytes.push(Buffer.from('\b'));
                        break;
                    case 't':
                        bytes.push(Buffer.from('\t'));
                        break;
                    case 'n':
                        bytes.push(Buffer.from('\n'));
                        break;
                    case 'r':
                        bytes.push(Buffer.from('\r'));
                        break;
                    default:
                        bytes.push(Buffer.from(str[i + 1]));
                }
                i += 1;
                // eslint-disable-next-line no-continue
                continue;
            }
        }
        bytes.push(Buffer.from(str[i]));
    }
    return Buffer.concat(bytes);
};
function isHex(str) {
    return /^[A-F0-9]{1,2}$/i.test(str);
}
export var isJson = function (item) {
    var value = typeof item !== 'string' ? JSON.stringify(item) : item;
    try {
        value = JSON.parse(value);
    }
    catch (e) {
        return false;
    }
    return typeof value === 'object' && value !== null;
};
//# sourceMappingURL=parseResponse.js.map