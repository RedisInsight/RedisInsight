import { t } from 'testcafe';
import { AddNewDatabaseParameters } from '../../pageObjects/components/myRedisDatabase/add-redis-database';
import {
    HashKeyParameters,
    ListKeyParameters,
    SetKeyParameters,
    SortedSetKeyParameters,
    StreamKeyParameters
} from '../../pageObjects/browser-page';
import { sendDeleteRequest, sendPostRequest } from './api-common';
import { DatabaseAPIRequests } from './api-database';

const databaseAPIRequests = new DatabaseAPIRequests();

const bufferPathMask = '/databases/databaseId/keys?encoding=buffer';
export class APIKeyRequests {

    /**
     * Add Hash key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addHashKeyApi(
        keyParameters: HashKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );
        const requestBody = {
            keyName: keyParameters.keyName,
            fields: keyParameters.fields
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/hash?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Hash key request failed');
    }

    /**
     * Add Stream key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addStreamKeyApi(
        keyParameters: StreamKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );
        const requestBody = {
            keyName: keyParameters.keyName,
            entries: keyParameters.entries
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/streams?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Stream key request failed');
    }

    /**
     * Add Set key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addSetKeyApi(
        keyParameters: SetKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );
        const requestBody = {
            keyName: keyParameters.keyName,
            members: keyParameters.members
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/set?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Set key request failed');
    }

    /**
     * Add Sorted Set key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addSortedSetKeyApi(
        keyParameters: SortedSetKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );
        const requestBody = {
            keyName: keyParameters.keyName,
            members: keyParameters.members
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/zSet?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Sorted Set key request failed');
    }

    /**
     * Add List key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addListKeyApi(
        keyParameters: ListKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );
        const requestBody = {
            keyName: keyParameters.keyName,
            element: keyParameters.element
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/list?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new List key request failed');
    }

    /**
     * Search Key by name
     * @param keyName The key name
     * @param databaseParameters The database parameters
     */
    async searchKeyByNameApi(
        keyName: string,
        databaseName: string
    ): Promise<string[]> {
        const requestBody = {
            cursor: '0',
            match: keyName
        };
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseName
        );
        const response = await sendPostRequest(
            bufferPathMask.replace('databaseId', databaseId),
            requestBody
        );
        await t.expect(response.status).eql(200, 'Getting key request failed');
        return await response.body[0].keys;
    }

    /**
     * Delete Key by name if it exists
     * @param keyName The key name
     * @param databaseParameters The database parameters
     */
    async deleteKeyByNameApi(
        keyName: string,
        databaseName: string
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseName
        );
        const isKeyExist = await this.searchKeyByNameApi(keyName, databaseName);
        if (isKeyExist.length > 0) {
            const requestBody = { keyNames: [Buffer.from(keyName, 'utf-8')] };
            const response = await sendDeleteRequest(
                bufferPathMask.replace('databaseId', databaseId),
                requestBody
            );
            await t
                .expect(response.status)
                .eql(200, 'The deletion of the key request failed');
        }
    }
}
