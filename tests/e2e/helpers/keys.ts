import { createClient } from 'redis';
import { t } from 'testcafe';
import { Chance } from 'chance';
import { COMMANDS_TO_CREATE_KEY } from '../helpers/constants';
import { BrowserPage, CliPage } from '../pageObjects';
import { KeyData } from '../pageObjects/browser-page';
import { KeyTypesTexts } from './constants';
import { Common } from './common';
import { AddKeyArguments } from '../pageObjects/browser-page';

const common = new Common();
const cliPage = new CliPage();
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
    { textType: KeyTypesTexts.Hash, keyName: 'hash' },
    { textType: KeyTypesTexts.Set, keyName: 'set' },
    { textType: KeyTypesTexts.ZSet, keyName: 'zset' },
    { textType: KeyTypesTexts.List, keyName: 'list' },
    { textType: KeyTypesTexts.String, keyName: 'string' },
    { textType: KeyTypesTexts.ReJSON, keyName: 'json' },
    { textType: KeyTypesTexts.Stream, keyName: 'stream' },
    { textType: KeyTypesTexts.Graph, keyName: 'graph' },
    { textType: KeyTypesTexts.TimeSeries, keyName: 'timeSeries' }
];

/**
 * Adding keys of each type through the cli
 * @param keyData The key data
 */
export async function addKeysViaCli(keyData: KeyData): Promise<void> {
    await t.click(cliPage.cliExpandButton);
    for (const { textType, keyName } of keyData) {
        if (textType in COMMANDS_TO_CREATE_KEY) {
            await t.typeText(cliPage.cliCommandInput, COMMANDS_TO_CREATE_KEY[textType](keyName), { paste: true });
            await t.pressKey('enter');
        }
    }
    await t.click(cliPage.cliCollapseButton);
    await t.click(browserPage.refreshKeysButton);
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
    await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
}

/**
 * Populate database with hash keys
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key
 */
export async function populateDBWithHashes(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const dbConf = { host, port: Number(port) };
    const client = createClient(dbConf);

    await client.on('error', async function (error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function () {
        if (keyArguments.keysCount != undefined) {
            for (let i = 0; i < keyArguments.keysCount; i++) {
                const keyName = `${keyArguments.keyNameStartWith}${common.generateWord(20)}`;
                await client.hset([keyName, 'field1', 'Hello'], async (error: string) => {
                    if (error) throw error;
                });
            }
        }
        await client.quit();
    });
}

/**
 * Populate hash key with fields
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its fields
 */
export async function populateHashWithFields(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const dbConf = { host, port: Number(port) };
    const client = createClient(dbConf);
    const fields: string[] = [];

    await client.on('error', async function (error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function () {
        if (keyArguments.fieldsCount != undefined) {
            for (let i = 0; i < keyArguments.fieldsCount; i++) {
                const field = `${keyArguments.fieldStartWith}${common.generateWord(10)}`;
                const fieldValue = `${keyArguments.fieldValueStartWith}${common.generateWord(10)}`;
                fields.push(field, fieldValue);
            }
        }
        await client.hset(keyArguments.keyName, fields, async (error: string) => {
            if (error) throw error;
        });
        await client.quit();
    });
}

/**
 * Populate list key with elements
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its members
 */
export async function populateListWithElements(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const dbConf = { host, port: Number(port) };
    const client = createClient(dbConf);
    const elements: string[] = [];

    await client.on('error', async function (error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function () {
        if (keyArguments.elementsCount != undefined) {
            for (let i = 0; i < keyArguments.elementsCount; i++) {
                const element = `${keyArguments.elementStartWith}${common.generateWord(10)}`;
                elements.push(element);
            }
        }
        await client.lpush(keyArguments.keyName, elements, async (error: string) => {
            if (error) throw error;
        });
        await client.quit();
    });
}

/**
 * Populate set key with members
 * @param host The host of database
 * @param port The port of database
 * @param keyArguments The arguments of key and its members
 */
export async function populateSetWithMembers(host: string, port: string, keyArguments: AddKeyArguments): Promise<void> {
    const dbConf = { host, port: Number(port) };
    const client = createClient(dbConf);
    const members: string[] = [];

    await client.on('error', async function (error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function () {
        if (keyArguments.membersCount != undefined) {
            for (let i = 0; i < keyArguments.membersCount; i++) {
                const member = `${keyArguments.memberStartWith}${common.generateWord(10)}`;
                members.push(member);
            }
        }
        await client.sadd(keyArguments.keyName, members, async (error: string) => {
            if (error) throw error;
        });
        await client.quit();
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

    await client.on('error', async function (error: string) {
        throw new Error(error);
    });
    await client.on('connect', async function () {
        await client.flushall((error: string) => {
            if (error) throw error;
        });
        await client.quit();
    });
}
