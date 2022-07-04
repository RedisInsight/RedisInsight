
import { t } from 'testcafe';
import * as request from 'supertest';
import { asyncFilter, doAsyncStuff } from '../async-helper'
import { AddNewDatabaseParameters, SentinelParameters, OSSClusterParameters } from '../../pageObjects/add-redis-database-page';
import { apiUrl } from '../../helpers/conf';

const endpoint = apiUrl;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // lgtm[js/disabling-certificate-validation]

/**
 * Add a new Standalone database through api using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewStandaloneDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const response = await request(endpoint).post(`/instance`)
        .send({ "name": databaseParameters.databaseName, "host": databaseParameters.host, "port": databaseParameters.port }).set('Accept', 'application/json');

    await t.expect(await response.status).eql(201);
    await t.expect(await response.body.name).eql(databaseParameters.databaseName);
}

/**
 * Adda new database from OSS Cluster through api using host and port
 * @param databaseParameters The database parameters
 */
 export async function addNewOSSClusterDatabase(databaseParameters: OSSClusterParameters): Promise<void> {
    const response = await request(endpoint).post(`/instance`)
        .send({ "name": databaseParameters.ossClusterDatabaseName, "host": databaseParameters.ossClusterHost, "port": databaseParameters.ossClusterPort }).set('Accept', 'application/json');

    await t.expect(await response.status).eql(201);
    await t.expect(await response.body.name).eql(databaseParameters.ossClusterDatabaseName);
}

/**
 * Get all databases through api
 */
export async function getAllDatabases(): Promise<void> {
    const response = await request(endpoint).get(`/instance`)
        .set('Accept', 'application/json');

    await t.expect(await response.status).eql(200, 'getAllDatabases request failed');
    return await response.body;
}

/**
 * Get database through api using database name
 * @param databaseName The database name
 */
export async function getDatabaseByName(databaseName: string): Promise<void> {
    const results = await getAllDatabases();
    let res: object = {};
    res = await asyncFilter(results, async item => {
        await doAsyncStuff();
        return await item.name == databaseName;
    });

    return await res[0].id;
}

/**
 * Delete database through api using database name
 * @param databaseName The database name
 */
export async function deleteDatabaseByName(databaseName: string): Promise<void> {
    const databaseId = await getDatabaseByName(databaseName);
    const response = await request(endpoint).delete(`/instance`)
        .send({ "ids": [`${databaseId}`] }).set('Accept', 'application/json');

    await t.expect(await response.status).eql(200, 'deleteDatabaseByName request failed');
}
