import { createClient } from 'redis';
import { t } from 'testcafe';
import { Chance } from 'chance';
import { random } from 'lodash';
import { BrowserPage } from '../pageObjects';
import { KeyData, AddKeyArguments } from '../pageObjects/browser-page';
import { COMMANDS_TO_CREATE_KEY, KeyTypesTexts } from './constants';
import { Common } from './common';
import { populateBigKeys, populateDb } from './scripts/generate-big-data';

const browserPage = new BrowserPage();

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
    { textType: KeyTypesTexts.Hash, keyName: 'hash', data: 'value' },
    { textType: KeyTypesTexts.List, keyName: 'list_', data: 'value' },
    { textType: KeyTypesTexts.Set, keyName: 'set', data: 'member' },
    { textType: KeyTypesTexts.ZSet, keyName: 'zset', data: 'member' },
    { textType: KeyTypesTexts.String, keyName: 'string', data: 'value' },
    { textType: KeyTypesTexts.ReJSON, keyName: 'json', data: 'data' },
    { textType: KeyTypesTexts.Stream, keyName: 'stream', data: 'field' },
    { textType: KeyTypesTexts.Graph, keyName: 'graph' },
    { textType: KeyTypesTexts.TimeSeries, keyName: 'timeSeries' }
];

export const formattersKeyTypes = [
    { textType: KeyTypesTexts.Hash, keyName: 'hash', data: 'value' },
    { textType: KeyTypesTexts.List, keyName: 'list_', data: 'value' },
    { textType: KeyTypesTexts.Set, keyName: 'set', data: 'member' },
    { textType: KeyTypesTexts.ZSet, keyName: 'zset', data: 'member' },
    { textType: KeyTypesTexts.String, keyName: 'string', data: 'value' },
    { textType: KeyTypesTexts.Stream, keyName: 'stream', data: 'field' }
];

/**
 * Adding keys of each type through the cli
 * @param keyData The key data
 * @param keyValue The key value
 * @param keyField The key field value
 */
export async function addKeysViaCli(keyData: KeyData, keyValue?: string, keyField?: string): Promise<void> {
    await t.click(browserPage.Cli.cliExpandButton);
    for (const { textType, keyName } of keyData) {
        if (textType in COMMANDS_TO_CREATE_KEY) {
            textType === 'Hash' || textType === 'Stream'
                ? await t.typeText(browserPage.Cli.cliCommandInput, COMMANDS_TO_CREATE_KEY[textType](keyName, keyValue, keyField), { paste: true })
                : await t.typeText(browserPage.Cli.cliCommandInput, COMMANDS_TO_CREATE_KEY[textType](keyName, keyValue), { paste: true });
            await t.pressKey('enter');
        }
    }
    await t
        .click(browserPage.Cli.cliCollapseButton)
        .click(browserPage.refreshKeysButton);
}

/**
 * Delete keys of each type through the cli
 * @param keyData The key data
 */
export async function deleteKeysViaCli(keyData: KeyData): Promise<void> {
    const keys: string[] = [];
    for (const { keyName } of keyData) {
        keys.push(keyName);
    }
    await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
}

/**
 * Populate database with hash keys
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key
 */
export async function populateDBWithHashes(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({ url });

    client.on('error', (error: Error) => {
        console.error('Redis Client Error, check DB connection', error);
        throw error;
    });

    try {
        await client.connect();

        if (keyArguments.keysCount) {
            for (let i = 0; i < keyArguments.keysCount; i++) {
                const keyName = `${keyArguments.keyNameStartWith}${Common.generateWord(20)}`;
                await client.hSet(keyName, 'field1', 'Hello');
            }
        }

    } catch (error) {
        console.error('Error during Redis operations:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Populate hash key with fields
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its fields
 */
export async function populateHashWithFields(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({url});
    const fields: Record<string, string> = {};

    client.on('error', (error: Error) => {
        console.error('Redis Client Error, check DB connection', error);
        throw error;
    });

    try {
        await client.connect();

        if (keyArguments.fieldsCount) {
            for (let i = 0; i < keyArguments.fieldsCount; i++) {
                const field = `${keyArguments.fieldStartWith}${Common.generateWord(10)}`;
                const fieldValue = `${keyArguments.fieldValueStartWith}${Common.generateWord(10)}`;
                fields[field] = fieldValue;
            }
        }

        if (keyArguments.keyName) {
            await client.hSet(keyArguments.keyName, fields);
        } else {
            throw new Error('keyName is required to populate the hash.');
        }

    } catch (error) {
        console.error('Error setting hash fields:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Populate list key with elements
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its members
 */
export async function populateListWithElements(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({ url });
    const elements: string[] = [];

    client.on('error', (error: Error) => {
        console.error('Redis Client Error', error);
        throw error;
    });

    try {
        await client.connect();

        if (keyArguments.elementsCount) {
            for (let i = 0; i < keyArguments.elementsCount; i++) {
                const element = `${keyArguments.elementStartWith}${Common.generateWord(10)}`;
                elements.push(element);
            }
        }

        if (keyArguments.keyName) {
            await client.lPush(keyArguments.keyName, elements);
        } else {
            throw new Error('keyName is required to populate the list.');
        }

    } catch (error) {
        console.error('Error pushing elements to list:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Populate set key with members
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its members
 */
export async function populateSetWithMembers(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({ url });
    const members: string[] = [];

    client.on('error', (error: Error) => {
        console.error('Redis Client Error', error);
        throw error;
    });

    try {
        await client.connect();

        if (keyArguments.membersCount) {
            for (let i = 0; i < keyArguments.membersCount; i++) {
                const member = `${keyArguments.memberStartWith}${Common.generateWord(10)}`;
                members.push(member);
            }
        }

        if (keyArguments.keyName) {
            await client.sAdd(keyArguments.keyName, members);
        } else {
            throw new Error('keyName is required to populate the set.');
        }

    } catch (error) {
        console.error('Error adding members to set:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Populate Zset key with members
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its members
 */
export async function populateZSetWithMembers(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({ url });
    const minScoreValue = -10;
    const maxScoreValue = 10;
    const members: { score: number; value: string }[] = [];

    client.on('error', (error: Error) => {
        console.error('Redis Client Error', error);
    });

    try {
        await client.connect();

        if (keyArguments.membersCount) {
            for (let i = 0; i < keyArguments.membersCount; i++) {
                const memberName = `${keyArguments.memberStartWith}${Common.generateWord(10)}`;
                const scoreValue = random(minScoreValue, maxScoreValue);
                members.push({ score: scoreValue, value: memberName });
            }
        }

        if (keyArguments.keyName) {
            await client.zAdd(keyArguments.keyName, members);
        } else {
            throw new Error('keyName is required to populate the sorted set.');
        }

    } catch (error) {
        console.error('Error adding members to sorted set:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Delete all keys from database
 * @param host The host of database
 * @param port The port of database
 */
export async function deleteAllKeysFromDB(host: string, port: string): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({
        url,
        socket: {
            connectTimeout: 10000
        }
    });

    client.on('error', (error: Error) => {
        console.error('Redis Client Error', error);
        throw error;
    });

    try {
        await client.connect();

        await client.flushAll();

    } catch (error) {
        console.error('Error flushing database:', error);
    } finally {
        await client.disconnect();
    }
}

export async function populateBigData(host: string, port: string): Promise<void> {
    const url = `redis://default@${host}:${port}`;
    const client = createClient({
        url,
        socket: {
            connectTimeout: 10000
        }
    });

    client.on('error', (error: Error) => {
        console.error('Redis Client Error', error);
    });

    try {
        await populateDb(client, {
            mainKeysLimit: 50_000, // 50_000 main keys, default 500_000
            secondaryKeysLimit: 12_500, // 12_500 secondary keys, default 125_000
        });
        await populateBigKeys(client);
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        await client.disconnect();
    }
}

/**
* Verifying if the Keys are in the List of keys
* @param keyNames The names of the keys
* @param isDisplayed True if keys should be displayed
*/
export async function verifyKeysDisplayingInTheList(keyNames: string[], isDisplayed: boolean): Promise<void> {
    for (const keyName of keyNames) {
        isDisplayed
            ? await t.expect(browserPage.getKeySelectorByName(keyName).exists).ok(`The key ${keyName} not found`)
            : await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk(`The key ${keyName} found`);
    }
}

/**
* Verify search/filter value
* @param value The value in search/filter input
*/
export async function verifySearchFilterValue(value: string): Promise<void> {
    await t.expect(browserPage.filterByPatterSearchInput.withAttribute('value', value).exists).ok(`Filter per key name ${value} is not applied/correct`);
}
