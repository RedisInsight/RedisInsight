import { t } from 'testcafe';
import { Chance } from 'chance';
import * as request from 'supertest';
import { asyncFilter, doAsyncStuff } from '../async-helper';
import { AddNewDatabaseParameters, OSSClusterParameters, databaseParameters, SentinelParameters, ClusterNodes } from '../../pageObjects/components/myRedisDatabase/add-redis-database';
import { Common } from '../common';

const chance = new Chance();
const endpoint = Common.getEndpoint();

/**
 * Add a new Standalone database through api using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const uniqueId = chance.string({ length: 10 });
    const requestBody = {
        'name': databaseParameters.databaseName,
        'host': databaseParameters.host,
        'port': Number(databaseParameters.port),
        'username': databaseParameters.databaseUsername,
        'password': databaseParameters.databasePassword
    };

    if (databaseParameters.caCert) {
        requestBody['tls'] = true;
        requestBody['verifyServerCert'] = false;
        requestBody['caCert'] = {
            'name': `ca}-${uniqueId}`,
            'certificate': databaseParameters.caCert.certificate
        };
        requestBody['clientCert'] = {
            'name': `client}-${uniqueId}`,
            'certificate': databaseParameters.clientCert!.certificate,
            'key': databaseParameters.clientCert!.key
        };
    }

    const response = await request(endpoint).post('/databases')
        .send(requestBody)
        .set('Accept', 'application/json');
    await t
        .expect(response.status).eql(201, `The creation of ${databaseParameters.databaseName} standalone database request failed: ${await response.body.message}`)
        .expect(await response.body.name).eql(databaseParameters.databaseName, `Database Name is not equal to ${databaseParameters.databaseName} in response`);
}

/**
 * Add a new Standalone databases through api using host and port
 * @param databasesParameters The databases parameters array
 */
export async function addNewStandaloneDatabasesApi(databasesParameters: AddNewDatabaseParameters[]): Promise<void> {
    if (databasesParameters.length) {
        await databasesParameters.forEach(async parameter => {
            await addNewStandaloneDatabaseApi(parameter);
        });
    }
}

/**
 * Add a new database from OSS Cluster through api using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewOSSClusterDatabaseApi(databaseParameters: OSSClusterParameters): Promise<void> {
    const response = await request(endpoint).post('/databases')
        .send({
            'name': databaseParameters.ossClusterDatabaseName,
            'host': databaseParameters.ossClusterHost,
            'port': Number(databaseParameters.ossClusterPort) })
        .set('Accept', 'application/json');

    await t.expect(await response.status).eql(201, 'The creation of new oss cluster database request failed')
        .expect(await response.body.name).eql(databaseParameters.ossClusterDatabaseName, `Database Name is not equal to ${databaseParameters.ossClusterDatabaseName} in response`);
}

/**
 * Add a Sentinel database via autodiscover through api
 * @param databaseParameters The database parameters
 * @param primaryGroupsNumber Number of added primary groups
 */
export async function discoverSentinelDatabaseApi(databaseParameters: SentinelParameters, primaryGroupsNumber?: number): Promise<void> {
    let masters = databaseParameters.masters;
    if (primaryGroupsNumber) {
        masters = databaseParameters.masters!.slice(0, primaryGroupsNumber);
    }
    const response = await request(endpoint).post('/redis-sentinel/databases')
        .send({
            'host': databaseParameters.sentinelHost,
            'port': Number(databaseParameters.sentinelPort),
            'password': databaseParameters.sentinelPassword,
            'masters': masters
        })
        .set('Accept', 'application/json');

    await t.expect(response.status).eql(201, 'Autodiscovery of Sentinel database request failed');
}

/**
 * Get all databases through api
 */
export async function getAllDatabases(): Promise<string[]> {
    const response = await request(endpoint).get('/databases')
        .set('Accept', 'application/json').expect(200);
    return await response.body;
}

/**
 * Get database through api using database name
 * @param databaseName The database name
 */
export async function getDatabaseIdByName(databaseName?: string): Promise<string> {
    if (!databaseName) {
        throw new Error('Error: Missing databaseName');
    }
    let databaseId: any;
    const allDataBases = await getAllDatabases();
    const response = await asyncFilter(allDataBases, async(item: databaseParameters) => {
        await doAsyncStuff();
        return item.name === databaseName;
    });

    if (response.length !== 0) {
        databaseId = await response[0].id;
    }
    return databaseId;
}

/**
 * Get database through api using database connection type
 * @param connectionType The database connection type
 */
export async function getDatabaseByConnectionType(connectionType?: string): Promise<string> {
    if (!connectionType) {
        throw new Error('Error: Missing connectionType');
    }
    const allDataBases = await getAllDatabases();
    let response: object = {};
    response = await asyncFilter(allDataBases, async(item: databaseParameters) => {
        await doAsyncStuff();
        return await item.connectionType === connectionType;
    });
    return await response[0].id;
}

/**
 * Delete all databases through api
 */
export async function deleteAllDatabasesApi(): Promise<void> {
    const allDatabases = await getAllDatabases();
    if (allDatabases.length > 0) {
        const databaseIds: string[] = [];
        for (let i = 0; i < allDatabases.length; i++) {
            const dbData = JSON.parse(JSON.stringify(allDatabases[i]));
            databaseIds.push(dbData.id);
        }
        if (databaseIds.length > 0) {
            await request(endpoint).delete('/databases')
                .send({ 'ids': databaseIds })
                .set('Accept', 'application/json')
                .expect(200);
        }
    }
}

/**
 * Delete Standalone database through api
 * @param databaseParameters The database parameters
 */
export async function deleteStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const databaseId = await getDatabaseIdByName(databaseParameters.databaseName);
    await request(endpoint).delete('/databases')
        .send({ 'ids': [`${databaseId}`] })
        .set('Accept', 'application/json')
        .expect(200);
}

/**
 * Delete Standalone databases using their names through api
 * @param databaseNames Databases names
 */
export async function deleteStandaloneDatabasesByNamesApi(databaseNames: string[]): Promise<void> {
    databaseNames.forEach(async databaseName => {
        const databaseId = await getDatabaseIdByName(databaseName);
        if (databaseId) {
            await request(endpoint).delete('/databases')
                .send({ 'ids': [`${databaseId}`] })
                .set('Accept', 'application/json')
                .expect(200);
        }
    });
}

/**
 * Delete database from OSS Cluster through api
 * @param databaseParameters The database parameters
 */
export async function deleteOSSClusterDatabaseApi(databaseParameters: OSSClusterParameters): Promise<void> {
    const databaseId = await getDatabaseIdByName(databaseParameters.ossClusterDatabaseName);
    const response = await request(endpoint).delete('/databases')
        .send({ 'ids': [`${databaseId}`] }).set('Accept', 'application/json');

    await t.expect(response.status).eql(200, 'Delete OSS cluster database request failed');
}

/**
 * Delete all primary groups from Sentinel through api
 * @param databaseParameters The database parameters
 */
export async function deleteAllSentinelDatabasesApi(databaseParameters: SentinelParameters): Promise<void> {
    for (let i = 0; i < databaseParameters.name!.length; i++) {
        const databaseId = await getDatabaseIdByName(databaseParameters.name![i]);
        const response = await request(endpoint).delete('/databases')
            .send({ 'ids': [`${databaseId}`] }).set('Accept', 'application/json');
        await t.expect(response.status).eql(200, 'Delete Sentinel database request failed');
    }
}

/**
 * Delete all databases by connection type
 */
export async function deleteAllDatabasesByConnectionTypeApi(connectionType: string): Promise<void> {
    const databaseIds = await getDatabaseByConnectionType(connectionType);
    const response = await request(endpoint).delete('/databases')
        .send({ 'ids': [`${databaseIds}`] }).set('Accept', 'application/json');
    await t.expect(response.status).eql(200, 'Delete Sentinel database request failed');
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

/**
 * Get OSS Cluster nodes
 * @param databaseParameters The database parameters
 */
export async function getClusterNodesApi(databaseParameters: OSSClusterParameters): Promise<string[]> {
    const databaseId = await getDatabaseIdByName(databaseParameters.ossClusterDatabaseName);
    const response = await request(endpoint)
        .get(`/databases/${databaseId}/cluster-details`)
        .set('Accept', 'application/json')
        .expect(200);
    const nodes = await response.body.nodes;
    const nodeNames = await nodes.map((node: ClusterNodes) => (`${node.host  }:${  node.port}`));
    return nodeNames;
}
