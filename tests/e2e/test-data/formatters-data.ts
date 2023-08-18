/**
 * Formatters objects with test data for format convertion
 */
export const formatters = [{
    format: 'JSON',
    fromText: '{ "field": "value" }',
    fromTextEdit: '{ "field": "value123" }',
    fromBigInt: '{ "field": 248480010225057793 }'
},
{
    format: 'Msgpack',
    fromHexText: 'DF00000001A56669656C64A576616C7565',
    fromText: '{ "field": "value" }',
    fromTextEdit: '{ "field": "value123" }',
    formattedText: '{ "field": "value" }'
},
{
    format: 'Protobuf',
    fromHexText: '08d90f10d802',
    formattedText: '[ { "1": 2009 }, { "2": 344 } ]'
},
{
    format: 'PHP serialized',
    fromText: 'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}',
    fromTextEdit: '[ "Sample array", [ "Apple", "Orange15" ] ]',
    formattedText: '[ "Sample array", [ "Apple", "Orange" ] ]'
},
{
    format: 'Java serialized',
    fromHexText: 'aced000573720008456d706c6f796565025e743467c6123c0200034900066e756d6265724c0007616464726573737400124c6a6176612f6c616e672f537472696e673b4c00046e616d6571007e000178700000006574001950686f6b6b61204b75616e2c20416d62656874612050656572740009526579616e20416c69',
    formattedText: '{ "fields": [ { "number": 101 }, { "address": "Phokka Kuan, Ambehta Peer" }, { "name": "Reyan Ali" } ], "annotations": [], "className": "Employee", "serialVersionUid": "170701604314812988" }'
},
{
    format: 'ASCII',
    fromText: '山女子水 рус ascii',
    fromTextEdit: '山女子水 рус ascii 山女子',
    formattedText: '\\xe5\\xb1\\xb1\\xe5\\xa5\\xb3\\xe5\\xad\\x90\\xe6\\xb0\\xb4 \\xd1\\x80\\xd1\\x83\\xd1\\x81 ascii',
    formattedTextEdit: '\\xe5\\xb1\\xb1\\xe5\\xa5\\xb3\\xe5\\xad\\x90\\xe6\\xb0\\xb4 \\xd1\\x80\\xd1\\x83\\xd1\\x81 ascii \\xe5\\xb1\\xb1\\xe5\\xa5\\xb3\\xe5\\xad\\x90'
},
{
    format: 'HEX',
    fromText: '山女子水 рус hex',
    fromTextEdit: '山女子水 рус hex 山女子',
    formattedText: 'e5b1b1e5a5b3e5ad90e6b0b420d180d183d18120686578',
    formattedTextEdit: 'e5b1b1e5a5b3e5ad90e6b0b420d180d183d1812068657820e5b1b1e5a5b3e5ad90'
},
{
    format: 'Binary',
    fromText: '水 рус bin',
    fromTextEdit: '水山 рус bin 子',
    formattedText: '1110011010110000101101000010000011010001100000001101000110000011110100011000000100100000011000100110100101101110',
    formattedTextEdit: '111001101011000010110100111001011011000110110001001000001101000110000000110100011000001111010001100000010010000001100010011010010110111000100000111001011010110110010000'
},
{
    format: 'Pickle',
    fromHexText: '286470300a5327617272270a70310a286c70320a49310a6149320a617353276f626a270a70330a286470340a532761270a70350a532762270a70360a7373532748656c6c6f270a70370a5327776f726c64270a70380a732e',
    formattedText: '{ "arr": [ 1, 2 ], "obj": { "a": "b" }, "Hello": "world" }'
}];

/**
 * PHP data for convertion including different php serialized data types
 */
export const phpData = [{
    dataType: 'Object',
    from: 'a:6:{i:1;s:30:"PHP code tester Sandbox Online";s:5:"emoji";s:24:"😀 😃 😄 😁 😆";i:2;i:5;i:5;i:89009;s:13:"Random number";i:341;s:11:"PHP Version";s:5:"8.1.9";}',
    converted: '{ "1": "PHP code tester Sandbox Online", "2": 5, "5": 89009, "emoji": "😀 😃 😄 😁 😆", "Random number": 341, "PHP Version": "8.1.9" }'
},
{
    dataType: 'Number',
    from: 'i:34567234;',
    converted: '34567234'
},
{
    dataType: 'String',
    from: 's:72:"Dumbledore took Harry in his arms and turned toward the Dursleys\' house.";',
    converted: '"Dumbledore took Harry in his arms and turned toward the Dursleys\' house."'
}];
