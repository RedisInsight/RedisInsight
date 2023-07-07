import { t } from 'testcafe';
import * as request from 'supertest';
import { AddNewDatabaseParameters } from '../../pageObjects/components/myRedisDatabase/add-redis-database';
import { Common } from '../../helpers/common';
import {
    HashKeyParameters,
    ListKeyParameters,
    SetKeyParameters,
    SortedSetKeyParameters,
    StreamKeyParameters
} from '../../pageObjects/browser-page';
import { DatabaseAPIRequests } from './api-database';

const endpoint = Common.getEndpoint();
const databaseAPIRequests = new DatabaseAPIRequests();

/**
 * Add Hash key
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function addHashKeyApi(keyParameters: HashKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/databases/${databaseId}/hash?encoding=buffer`)
        .send({
            'keyName': keyParameters.keyName,
            'fields': keyParameters.fields
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'The creation of new Hash key request failed');
}

/**
 * Add Stream key
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function addStreamKeyApi(keyParameters: StreamKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/databases/${databaseId}/streams?encoding=buffer`)
        .send({
            'keyName': keyParameters.keyName,
            'entries': keyParameters.entries
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'The creation of new Stream key request failed');
}

/**
 * Add Set key
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function addSetKeyApi(keyParameters: SetKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/databases/${databaseId}/set?encoding=buffer`)
        .send({
            'keyName': keyParameters.keyName,
            'members': keyParameters.members
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'The creation of new Set key request failed');
}

/**
 * Add Sorted Set key
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function addSortedSetKeyApi(keyParameters: SortedSetKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/databases/${databaseId}/zSet?encoding=buffer`)
        .send({
            'keyName': keyParameters.keyName,
            'members': keyParameters.members
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'The creation of new Sorted Set key request failed');
}

/**
 * Add List key
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function addListKeyApi(keyParameters: ListKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/databases/${databaseId}/list?encoding=buffer`)
        .send({
            'keyName': keyParameters.keyName,
            'element': keyParameters.element
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'The creation of new List key request failed');
}

/**
 * Search Key by name
 * @param keyName The key name
 * @param databaseParameters The database parameters
 */
export async function searchKeyByNameApi(keyName: string, databaseParameters: AddNewDatabaseParameters): Promise<string[]> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).get(`/databases/${databaseId}/keys?cursor=0&count=5000&match=${keyName}`)
        .set('Accept', 'application/json').expect(200);

    return await response.body[0].keys;
}

/**
 * Delete Key by name if it exists
 * @param keyName The key name
 * @param databaseParameters The database parameters
 */
export async function deleteKeyByNameApi(keyName: string, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const isKeyExist = await searchKeyByNameApi(keyName, databaseParameters);
    if (isKeyExist.length > 0) {
        const response = await request(endpoint).delete(`/databases/${databaseId}/keys`)
            .send({ 'keyNames': [keyName] })
            .set('Accept', 'application/json');

        await t.expect(response.status).eql(200, 'The deletion of the key request failed');
    }
}

/**
 * Delete Keys by names
 * @param keyNames The names of keys
 * @param databaseParameters The database parameters
 */
export async function deleteKeysApi(keyNames: string[], databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName);
    const response = await request(endpoint).delete(`/databases/${databaseId}/keys`)
        .send({ 'keyNames': keyNames })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(200, 'The deletion of the keys request failed');
}
