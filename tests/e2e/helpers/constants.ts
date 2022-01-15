export enum DataTypesTexts {
    Hash = 'Hash',
    List = 'List',
    Set = 'Set',
    ZSet = 'Sorted Set',
    String = 'String',
    ReJSON = 'JSON',
    Stream = 'STREAM',
    Graph = 'GRAPH',
    TimeSeries = 'TS',
}
export const keyLength = 50;

export const COMMANDS_TO_CREATE_KEY = Object.freeze({
    [DataTypesTexts.Hash]: (key: string, field: string | number = 1, value: string | number = 1) => `HSET ${key} ${field} ${value}`,
    [DataTypesTexts.List]: (key: string, element: string | number = 1) => `LPUSH ${key} ${element}`,
    [DataTypesTexts.Set]: (key: string, member = 'member') => `SADD ${key} ${member}`,
    [DataTypesTexts.ZSet]: (key: string, score = 1, member = 'member') => `ZADD ${key} ${score} ${member}`,
    [DataTypesTexts.String]: (key: string, value = 'val') => `SET ${key} ${value}`,
    [DataTypesTexts.ReJSON]: (key: string, json = '"val"') => `JSON.SET ${key} . '${json}'`,
    [DataTypesTexts.Stream]: (key: string, field: string | number = 1, value: string | number = 1) => `XADD ${key} * ${field} ${value}`,
    [DataTypesTexts.Graph]: (key: string) => `GRAPH.QUERY ${key} "CREATE ()"`,
    [DataTypesTexts.TimeSeries]: (key: string) => `TS.CREATE ${key}`
})
