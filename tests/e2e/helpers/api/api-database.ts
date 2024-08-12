import { t } from 'testcafe';
import { Chance } from 'chance';
import { asyncFilter, doAsyncStuff } from '../async-helper';
import {
    AddNewDatabaseParameters,
    OSSClusterParameters,
    databaseParameters,
    SentinelParameters,
    ClusterNodes
} from '../../pageObjects/components/myRedisDatabase/add-redis-database';
import { ResourcePath } from '../constants';
import {
    sendGetRequest,
    sendPostRequest,
    sendDeleteRequest
} from './api-common';

const chance = new Chance();

export class DatabaseAPIRequests {
    /**
     * Add a new Standalone database through api using host and port
     * @param databaseParameters The database parameters
     */
    async addNewStandaloneDatabaseApi(
        databaseParameters: AddNewDatabaseParameters, isCloud = false
    ): Promise<void> {
        const uniqueId = chance.string({ length: 10 });
        const uniqueIdNumber = chance.integer({ min: 1, max: 1000 });
        const requestBody: {
            name?: string,
            host: string,
            port: number,
            username?: string,
            password?: string,
            tls?: boolean,
            verifyServerCert?: boolean,
            caCert?: {
                name: string,
                certificate?: string
            },
            clientCert?: {
                name: string,
                certificate?: string,
                key?: string
            },
            cloudDetails?: {
                cloudId: number,
                subscriptionType: string,
                planMemoryLimit: number,
                memoryLimitMeasurementUnit: string,
                free: boolean
            }
        } = {
            name: databaseParameters.databaseName,
            host: databaseParameters.host,
            port: Number(databaseParameters.port),
            username: databaseParameters.databaseUsername,
            password: databaseParameters.databasePassword
        };

        if (databaseParameters.caCert) {
            requestBody.tls = true;
            requestBody.verifyServerCert = false;
            requestBody.caCert = {
                name: `ca}-${uniqueId}`,
                certificate: databaseParameters.caCert.certificate
            };
            requestBody.clientCert = {
                name: `client}-${uniqueId}`,
                certificate: databaseParameters.clientCert!.certificate,
                key: databaseParameters.clientCert!.key
            };
        }

        if(isCloud) {
            requestBody.cloudDetails = {
                cloudId: uniqueIdNumber,
                subscriptionType: 'fixed',
                planMemoryLimit: 30,
                memoryLimitMeasurementUnit: 'mb',
                free: true
            };
        }
        const response = await sendPostRequest(
            ResourcePath.Databases,
            requestBody
        );
        await t
            .expect(await response.body.name)
            .eql(
                databaseParameters.databaseName,
                `Database Name is not equal to ${databaseParameters.databaseName} in response`
            );
        await t.expect(await response.status).eql(201);
    }

    /**
     * Add a new Standalone databases through api using host and port
     * @param databasesParameters The databases parameters array
     */
    async addNewStandaloneDatabasesApi(
        databasesParameters: AddNewDatabaseParameters[]
    ): Promise<void> {
        if (databasesParameters.length) {
            databasesParameters.forEach(async(parameter) => {
                await this.addNewStandaloneDatabaseApi(parameter);
            });
        }
    }

    /**
     * Add a new database from OSS Cluster through api using host and port
     * @param databaseParameters The database parameters
     */
    async addNewOSSClusterDatabaseApi(
        databaseParameters: OSSClusterParameters
    ): Promise<void> {
        const requestBody = {
            name: databaseParameters.ossClusterDatabaseName,
            host: databaseParameters.ossClusterHost,
            port: Number(databaseParameters.ossClusterPort)
        };
        const response = await sendPostRequest(
            ResourcePath.Databases,
            requestBody
        );
        await t
            .expect(await response.body.name)
            .eql(
                databaseParameters.ossClusterDatabaseName,
                `Database Name is not equal to ${databaseParameters.ossClusterDatabaseName} in response`
            );
        await t.expect(await response.status).eql(201);
    }

    /**
     * Add a Sentinel database via autodiscover through api
     * @param databaseParameters The database parameters
     * @param primaryGroupsNumber Number of added primary groups
     */
    async discoverSentinelDatabaseApi(
        databaseParameters: SentinelParameters,
        primaryGroupsNumber?: number
    ): Promise<void> {
        let masters = databaseParameters.masters;
        if (primaryGroupsNumber) {
            masters = databaseParameters.masters!.slice(0, primaryGroupsNumber);
        }
        const requestBody = {
            host: databaseParameters.sentinelHost,
            port: Number(databaseParameters.sentinelPort),
            password: databaseParameters.sentinelPassword,
            masters: masters
        };
        const resourcePath =
            ResourcePath.RedisSentinel + ResourcePath.Databases;
        const response = await sendPostRequest(resourcePath, requestBody);

        await t.expect(await response.status).eql(201);
    }

    /**
     * Get all databases through api
     */
    async getAllDatabases(): Promise<string[]> {
        const response = await sendGetRequest(ResourcePath.Databases);

        await t.expect(await response.status).eql(200);
        return await response.body;
    }

    /**
     * Get database through api using database name
     * @param databaseName The database name
     */
    async getDatabaseIdByName(databaseName?: string): Promise<string> {
        if (!databaseName) {
            throw new Error('Error: Missing databaseName');
        }
        let databaseId;
        const allDataBases = await this.getAllDatabases();
        const response = await asyncFilter(
            allDataBases,
            async(item: databaseParameters) => {
                await doAsyncStuff();
                return item.name === databaseName;
            }
        );

        if (response.length !== 0) {
            databaseId = await response[0].id;
        }
        return databaseId;
    }

    /**
     * Get database through api using database connection type
     * @param connectionType The database connection type
     */
    async getDatabaseByConnectionType(
        connectionType?: string
    ): Promise<string> {
        if (!connectionType) {
            throw new Error('Error: Missing connectionType');
        }
        const allDataBases = await this.getAllDatabases();
        let response: databaseParameters[] = [];
        response = await asyncFilter(
            allDataBases,
            async(item: databaseParameters) => {
                await doAsyncStuff();
                return item.connectionType === connectionType;
            }
        );
        return response?.[0]?.id;
    }

    /**
     * Delete all databases through api
     */
    async deleteAllDatabasesApi(): Promise<void> {
        const allDatabases = await this.getAllDatabases();
        console.log(`common db count is "${allDatabases}"`);
        if (allDatabases.length > 0) {
            const databaseIds: string[] = [];
            for (let i = 0; i < allDatabases.length; i++) {
                const dbData = JSON.parse(JSON.stringify(allDatabases[i]));
                databaseIds.push(dbData.id);
            }
            if (databaseIds.length > 0) {
                const requestBody = { ids: databaseIds };
                const response = await sendDeleteRequest(
                    ResourcePath.Databases,
                    requestBody
                );
                await t.expect(await response.status).eql(200);
            }
            await this.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
        }
    }

    /**
     * Delete Standalone database through api
     * @param databaseParameters The database parameters
     */
    async deleteStandaloneDatabaseApi(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await this.getDatabaseIdByName(
            databaseParameters.databaseName
        );
        if (databaseId) {
            const requestBody = { ids: [`${databaseId}`] };
            const response = await sendDeleteRequest(
                ResourcePath.Databases,
                requestBody
            );
            await t.expect(await response.status).eql(200);
        }
        else {
            throw new Error('Error: Missing databaseId');
        }
    }

    /**
     * Delete Standalone databases using their names through api
     * @param databaseNames Databases names
     */
    async deleteStandaloneDatabasesByNamesApi(
        databaseNames: string[]
    ): Promise<void> {
        databaseNames.forEach(async(databaseName) => {
            const databaseId = await this.getDatabaseIdByName(databaseName);
            if (databaseId) {
                const requestBody = { ids: [`${databaseId}`] };
                const response = await sendDeleteRequest(
                    ResourcePath.Databases,
                    requestBody
                );
                await t.expect(await response.status).eql(200);
            }
            else {
                throw new Error('Error: Missing databaseId');
            }
        });
    }

    /**
     * Delete database from OSS Cluster through api
     * @param databaseParameters The database parameters
     */
    async deleteOSSClusterDatabaseApi(
        databaseParameters: OSSClusterParameters
    ): Promise<void> {
        const databaseId = await this.getDatabaseIdByName(
            databaseParameters.ossClusterDatabaseName
        );
        const requestBody = { ids: [`${databaseId}`] };
        const response = await sendDeleteRequest(
            ResourcePath.Databases,
            requestBody
        );
        await t.expect(await response.status).eql(200);
    }

    /**
     * Delete all primary groups from Sentinel through api
     * @param databaseParameters The database parameters
     */
    async deleteAllSentinelDatabasesApi(
        databaseParameters: SentinelParameters
    ): Promise<void> {
        for (let i = 0; i < databaseParameters.name!.length; i++) {
            const databaseId = await this.getDatabaseIdByName(
                databaseParameters.name![i]
            );
            const requestBody = { ids: [`${databaseId}`] };
            const response = await sendDeleteRequest(
                ResourcePath.Databases,
                requestBody
            );
            await t.expect(await response.status).eql(200);
        }
    }

    /**
     * Delete all databases by connection type
     */
    async deleteAllDatabasesByConnectionTypeApi(
        connectionType: string
    ): Promise<void> {
        const databaseIds = await this.getDatabaseByConnectionType(
            connectionType
        );
        if(databaseIds?.length > 0) {
            const requestBody = { ids: [`${databaseIds}`] };
            const response = await sendDeleteRequest(
                ResourcePath.Databases,
                requestBody
            );
            await t.expect(await response.status).eql(200);
        }
    }

    /**
     * Delete Standalone databases through api
     * @param databasesParameters The databases parameters as array
     */
    async deleteStandaloneDatabasesApi(
        databasesParameters: AddNewDatabaseParameters[]
    ): Promise<void> {
        if (databasesParameters.length) {
            databasesParameters.forEach(async(parameter) => {
                await this.deleteStandaloneDatabaseApi(parameter);
            });
        }
    }

    /**
     * Get OSS Cluster nodes
     * @param databaseParameters The database parameters
     */
    async getClusterNodesApi(
        databaseParameters: OSSClusterParameters
    ): Promise<string[]> {
        const databaseId = await this.getDatabaseIdByName(
            databaseParameters.ossClusterDatabaseName
        );
        const resourcePath =
            `${ResourcePath.Databases  }/${databaseId}${  ResourcePath.ClusterDetails}`;
        const response = await sendGetRequest(resourcePath);

        await t.expect(await response.status).eql(200);

        const nodes = await response.body.nodes;
        const nodeNames = await nodes.map(
            (node: ClusterNodes) => `${node.host}:${node.port}`
        );
        return nodeNames;
    }
}
