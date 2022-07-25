import { t } from 'testcafe';
import * as request from 'supertest';
import { AddNewDatabaseParameters } from '../../pageObjects/add-redis-database-page';
import { endpoint } from '../../helpers/conf';
import {
    HashKeyParameters,
    ListKeyParameters,
    SetKeyParameters,
    SortedSetKeyParameters,
    StreamKeyParameters
} from '../../pageObjects/browser-page';
import { getDatabaseByName } from './api-database';

/**
 * Add Hash key
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function addHashKeyApi(keyParameters: HashKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/instance/${databaseId}/hash`)
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
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/instance/${databaseId}/streams`)
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
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/instance/${databaseId}/set`)
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
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/instance/${databaseId}/zSet`)
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
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).post(`/instance/${databaseId}/list`)
        .send({
            'keyName': keyParameters.keyName,
            'element': keyParameters.element
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'The creation of new List key request failed');
}

/**
 * Delete Key by name
 * @param keyParameters The key parameters
 * @param databaseParameters The database parameters
 */
export async function deleteKeyApi(keyParameters: ListKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).delete(`/instance/${databaseId}/keys`)
        .send({ 'keyNames': [keyParameters.keyName] })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(200, 'The deletion of the key request failed');
}

/**
 * Delete Keys by names
 * @param keyNames The names of keys
 * @param databaseParameters The database parameters
 */
export async function deleteKeysApi(keyNames: string[], databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    const response = await request(endpoint).delete(`/instance/${databaseId}/keys`)
        .send({ 'keyNames': keyNames })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(200, 'The deletion of the keys request failed');
}