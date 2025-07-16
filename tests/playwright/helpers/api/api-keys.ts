/* eslint-disable max-len */
import { AxiosInstance } from 'axios'
import { DatabaseAPIRequests } from './api-databases'
import {
    AddNewDatabaseParameters,
    HashKeyParameters,
    SetKeyParameters,
    StreamKeyParameters,
} from '../../types'

const bufferPathMask = '/databases/databaseId/keys?encoding=buffer'
export class APIKeyRequests {
    constructor(
        private apiClient: AxiosInstance,
        private databaseAPIRequests: DatabaseAPIRequests,
    ) {}

    async addStringKeyApi(
        keyParameters: { keyName: string; value: string; expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            value: Buffer.from(keyParameters.value, 'utf-8'),
            expire: keyParameters?.expire,
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/string?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new String key request failed')
        }
    }

    async addHashKeyApi(
        keyParameters: HashKeyParameters & { expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            fields: keyParameters.fields.map((fields) => ({
                ...fields,
                field: Buffer.from(fields.field, 'utf-8'),
                value: Buffer.from(fields.value, 'utf-8'),
            })),
            expire: keyParameters?.expire,
        }
        const response = await this.apiClient.post(
            `/databases/${databaseId}/hash?encoding=buffer`,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error('The creation of new Hash key request failed')
    }

    async addListKeyApi(
        keyParameters: { keyName: string; elements: string[]; expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            elements: keyParameters.elements.map((element) =>
                Buffer.from(element, 'utf-8'),
            ),
            expire: keyParameters?.expire,
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/list?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new List key request failed')
        }
    }

    async addStreamKeyApi(
        keyParameters: StreamKeyParameters,
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            entries: keyParameters.entries.map((member) => ({
                ...member,
                fields: member.fields.map(({ name, value }) => ({
                    name: Buffer.from(name, 'utf-8'),
                    value: Buffer.from(value, 'utf-8'),
                })),
            })),
        }
        const response = await this.apiClient.post(
            `/databases/${databaseId}/streams?encoding=buffer`,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error('The creation of new Stream key request failed')
    }

    async addSetKeyApi(
        keyParameters: SetKeyParameters & { expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            members: keyParameters.members.map((member) =>
                Buffer.from(member, 'utf-8'),
            ),
            expire: keyParameters?.expire,
        }
        const response = await this.apiClient.post(
            `/databases/${databaseId}/set?encoding=buffer`,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error('The creation of new Set key request failed')
    }

    async addZSetKeyApi(
        keyParameters: {
            keyName: string
            members: Array<{ name: string; score: number }>
            expire?: number
        },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            members: keyParameters.members.map((member) => ({
                name: Buffer.from(member.name, 'utf-8'),
                score: member.score,
            })),
            expire: keyParameters?.expire,
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/zSet?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new ZSet key request failed')
        }
    }

    async searchKeyByNameApi(
        keyName: string,
        databaseName: string,
    ): Promise<string[]> {
        const requestBody = {
            cursor: '0',
            match: keyName,
        }
        const databaseId =
            await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        const response = await this.apiClient.post(
            bufferPathMask.replace('databaseId', databaseId),
            requestBody,
        )
        if (response.status !== 200)
            throw new Error('Getting key request failed')
        return response.data[0].keys
    }

    async deleteKeyByNameApi(
        keyName: string,
        databaseName: string,
    ): Promise<void> {
        const databaseId =
            await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        const doesKeyExist = await this.searchKeyByNameApi(
            keyName,
            databaseName,
        )
        if (doesKeyExist.length > 0) {
            const requestBody = { keyNames: [Buffer.from(keyName, 'utf-8')] }
            const response = await this.apiClient.delete(
                bufferPathMask.replace('databaseId', databaseId),
                {
                    data: requestBody,
                },
            )
            if (response.status !== 200)
                throw new Error('The deletion of the key request failed')
        }
    }
}
