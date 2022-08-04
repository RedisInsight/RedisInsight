import { createClient } from 'redis';
import { Chance } from 'chance';
import { KeyTypesTexts } from './constants';
import { Common } from './common';

const common = new Common();

export function getRandomKeyName(keyNameLength: number): string {
    const chance = new Chance();
    let result = '';
    for (let i = 0; i < keyNameLength; i++) {
        result += chance.character();
    }
    return result;
}

/**
 * Create random paragraph with amount of sentences
 * @param sentences The amount of sentences in paragraph
 */
export function getRandomParagraph(sentences: number): string {
    const chance = new Chance();
    return chance.paragraph({ sentences: sentences });
}

export const keyTypes = [
    { textType: KeyTypesTexts.Hash, keyName: 'hash' },
    { textType: KeyTypesTexts.Set, keyName: 'set' },
    { textType: KeyTypesTexts.ZSet, keyName: 'zset' },
    { textType: KeyTypesTexts.List, keyName: 'list' },
    { textType: KeyTypesTexts.String, keyName: 'string' },
    { textType: KeyTypesTexts.Graph, keyName: 'graph' },
    { textType: KeyTypesTexts.ReJSON, keyName: 'json' },
    { textType: KeyTypesTexts.Stream, keyName: 'stream' },
    { textType: KeyTypesTexts.TimeSeries, keyName: 'timeSeries' }
];

/**
 * Populate database with hash keys
 * @param host The host of database
 * @param port The port of database
 * @param count The count of keys to add
 * @param keyNameStartWith The name of the key
 */
export async function populateDBWithHashes(host: string, port: string, count: number, keyNameStartWith: string): Promise<void> {
    const dbConf = { host, port: Number(port) };
    const client = createClient(dbConf);

    await client.on('error', async function(error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function() {
        for (let i = 0; i < count; i++) {
            const keyName = `${keyNameStartWith}${common.generateWord(20)}`;
            await client.hset([keyName, 'field1', 'Hello'], async(error: string) => {
                if (error) {
                    throw error;
                }
            });
        }
    });
}

/**
 * Delete all keys from database
 * @param host The host of database
 * @param port The port of database
 */
export async function deleteAllKeysFromDB(host: string, port: string): Promise<void> {
    const dbConf = { host, port: Number(port) };
    const client = createClient(dbConf);

    await client.on('error', async function(error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function() {
        await client.flushall((error: string) => {
            if (error) {
                throw error;
            }
        });
    });
}
