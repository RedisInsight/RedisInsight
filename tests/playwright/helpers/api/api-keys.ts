import {AxiosInstance} from 'axios'
import { HttpClient } from './http-client'
import { DatabaseAPIRequests } from './api-databases'
import {
    AddNewDatabaseParameters,
    HashKeyParameters,
    SetKeyParameters,
    StreamKeyParameters} from '../../types'

const bufferPathMask = '/databases/databaseId/keys?encoding=buffer'
export class APIKeyRequests {

    private databaseAPIRequests: DatabaseAPIRequests
    private apiClient: AxiosInstance

    constructor(apiUrl: string) {
        this.apiClient = new HttpClient(apiUrl).getClient()
        this.databaseAPIRequests = new DatabaseAPIRequests(apiUrl)
    }

    async addHashKeyApi(keyParameters: HashKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            fields: keyParameters.fields.map(fields => ({
                ...fields,
                field: Buffer.from(fields.field, 'utf-8'),
                value: Buffer.from(fields.value, 'utf-8')
            }))
        }
        const response = await this.apiClient.post(`/databases/${databaseId}/hash?encoding=buffer`, requestBody)
        if (response.status !== 201) throw new Error('The creation of new Hash key request failed')
    }

    async addStreamKeyApi(keyParameters: StreamKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            entries: keyParameters.entries.map(member => ({
                ...member,
                fields: member.fields.map(({ name, value }) => ({
                    name: Buffer.from(name, 'utf-8'),
                    value: Buffer.from(value, 'utf-8')
                }))
            }))
        }
        const response = await this.apiClient.post(`/databases/${databaseId}/streams?encoding=buffer`, requestBody)
        if (response.status !== 201) throw new Error('The creation of new Stream key request failed')
    }

    async addSetKeyApi(keyParameters: SetKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            members: keyParameters.members.map(member => Buffer.from(member, 'utf-8'))
        }
        const response = await this.apiClient.post(`/databases/${databaseId}/set?encoding=buffer`, requestBody)
        if (response.status !== 201) throw new Error('The creation of new Set key request failed')
    }

    async searchKeyByNameApi(keyName: string, databaseName: string, xWindowsId: string): Promise<string[]> {
        const requestBody = {
            cursor: '0',
            match: keyName
        }
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName, xWindowsId)
        const response = await this.apiClient.post(bufferPathMask.replace('databaseId', databaseId), requestBody)
        if (response.status !== 200) throw new Error('Getting key request failed')
        return response.data[0].keys
    }

    async deleteKeyByNameApi(keyName: string, databaseName: string, xWindowsId: string): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName, xWindowsId)
        const doesKeyExist = await this.searchKeyByNameApi(keyName, databaseName)
        if (doesKeyExist.length > 0) {
            const requestBody = { keyNames: [Buffer.from(keyName, 'utf-8')] }
            const response = await this.apiClient.delete(bufferPathMask.replace('databaseId', databaseId), { data: requestBody,
            headers:{
                'X-Window-Id': xWindowsId
            }})
            if (response.status !== 200) throw new Error('The deletion of the key request failed')
        }
    }
}
