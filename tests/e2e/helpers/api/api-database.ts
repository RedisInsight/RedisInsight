import { t } from 'testcafe';
import * as request from 'supertest';
import { asyncFilter, doAsyncStuff } from '../async-helper';
import { AddNewDatabaseParameters, OSSClusterParameters, databaseParameters } from '../../pageObjects/add-redis-database-page';
import { apiUrl } from '../../helpers/conf';

const endpoint = apiUrl;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // lgtm[js/disabling-certificate-validation]

/**
 * Add a new Standalone database through api using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const response = await request(endpoint).post('/instance')
        .send({ 'name': databaseParameters.databaseName, 'host': databaseParameters.host, 'port': databaseParameters.port })
        .set('Accept', 'application/json');

    await t.expect(await response.status).eql(201, 'The creation of new standalone database request failed');
    await t.expect(await response.body.name).eql(databaseParameters.databaseName, `Database Name is not equal to ${databaseParameters.databaseName} in response`);
}

/**
 * Add a new Standalone databases through api using host and port
 * @param databasesParameters The databases parameters array
 */
export async function addNewStandaloneDatabasesApi(databasesParameters: AddNewDatabaseParameters[]): Promise<void> {
    if (await databasesParameters.length) {
        await databasesParameters.forEach(async parameter => {
            await addNewStandaloneDatabaseApi(parameter);
        });
    }
}

/**
 * Adda new database from OSS Cluster through api using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewOSSClusterDatabaseApi(databaseParameters: OSSClusterParameters): Promise<void> {
    const response = await request(endpoint).post('/instance')
        .send({ 'name': databaseParameters.ossClusterDatabaseName, 'host': databaseParameters.ossClusterHost, 'port': databaseParameters.ossClusterPort })
        .set('Accept', 'application/json');

    await t.expect(await response.status).eql(201, 'The creation of new oss cluster database request failed');
    await t.expect(await response.body.name).eql(databaseParameters.ossClusterDatabaseName, `Database Name is not equal to ${databaseParameters.ossClusterDatabaseName} in response`);
}

/**
 * Get all databases through api
 */
export async function getAllDatabases(): Promise<string[]> {
    const response = await request(endpoint).get('/instance')
        .set('Accept', 'application/json').expect(200);
    return await response.body;
}

/**
 * Get database through api using database name
 * @param databaseName The database name
 */
export async function getDatabaseByName(databaseName?: string): Promise<string> {
    if (!databaseName) {
        throw new Error('Error: Missing databaseName');
    }
    const allDataBases = await getAllDatabases();
    let response: object = {};
    response = await asyncFilter(allDataBases, async(item: databaseParameters) => {
        await doAsyncStuff();
        return await item.name === databaseName;
    });

    return await response[0].id;
}

/**
 * Delete Standalone database through api
 * @param databaseParameters The database parameters
 */
export async function deleteStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await getDatabaseByName(databaseParameters.databaseName);
    await request(endpoint).delete('/instance')
        .send({ 'ids': [`${databaseId}`] })
        .set('Accept', 'application/json')
        .expect(200);
}

/**
 * Delete database from OSS Cluster through api
 * @param databaseParameters The database parameters
 */
export async function deleteOSSClusterDatabaseApi(databaseParameters: OSSClusterParameters): Promise<void> {
    const databaseId = await getDatabaseByName(databaseParameters.ossClusterDatabaseName);
    const response = await request(endpoint).delete('/instance')
        .send({ 'ids': [`${databaseId}`] }).set('Accept', 'application/json');

    await t.expect(response.status).eql(200, 'Delete OSS cluster database request failed');
}

/**
 * Delete Standalone databases through api
 * @param databasesParameters The databases parameters as array
 */
export async function deleteStandaloneDatabasesApi(databasesParameters: AddNewDatabaseParameters[]): Promise<void> {
    if (await databasesParameters.length) {
        await databasesParameters.forEach(async parameter => {
            await deleteStandaloneDatabaseApi(parameter);
        });
    }
}
