import { Chance } from 'chance';
import { DataTypesTexts } from './constants';

export function getRandomKeyName(keyNameLength: number): string {
    const chance = new Chance();
    let result = '';
    for (let i = 0; i < keyNameLength; i++) {
        result += chance.character();
    }
    return result;
}

export const dataTypes = [
    { textType: DataTypesTexts.Hash, keyName: 'hash' },
    { textType: DataTypesTexts.Set, keyName: 'set' },
    { textType: DataTypesTexts.ZSet, keyName: 'zset' },
    { textType: DataTypesTexts.List, keyName: 'list' },
    { textType: DataTypesTexts.String, keyName: 'string' },
    { textType: DataTypesTexts.Graph, keyName: 'graph' },
    { textType: DataTypesTexts.ReJSON, keyName: 'json' },
    { textType: DataTypesTexts.Stream, keyName: 'stream' },
    { textType: DataTypesTexts.TimeSeries, keyName: 'timeSeries' }
]
