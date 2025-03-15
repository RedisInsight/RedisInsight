import { HttpClient } from './http-client'
import { DatabaseAPIRequests } from './api-databases'
import {
    AddNewDatabaseParameters,
    HashKeyParameters,
    StringKeyParameters,
    ListKeyParameters,
    SetKeyParameters,
    SortedSetKeyParameters,
    StreamKeyParameters} from '../../types'


const bufferPathMask = '/databases/databaseId/keys?encoding=buffer'

export class APIKeyRequests {
    private httpClient: HttpClient
    private databaseAPIRequests : DatabaseAPIRequests

    constructor(baseURL: string) {
        this.httpClient = new HttpClient(baseURL)
        this.databaseAPIRequests = new DatabaseAPIRequests(baseURL)
    }

    private async getDatabaseId(databaseName: string): Promise<string> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        if (!databaseId) throw new Error(`Database with name ${databaseName} not found`)
        return databaseId
    }

    async addHashKeyApi(keyParameters: HashKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseId(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            fields: keyParameters.fields.map(fields => ({
                ...fields,
                field: Buffer.from(fields.field, 'utf-8'),
                value: Buffer.from(fields.value, 'utf-8')
            }))
        }

        await this.httpClient.post(`/databases/${databaseId}/hash?encoding=buffer`, requestBody)
    }

    async addStreamKeyApi(keyParameters: StreamKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseId(databaseParameters.databaseName)
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

        await this.httpClient.post(`/databases/${databaseId}/streams?encoding=buffer`, requestBody)
    }

    async addSetKeyApi(keyParameters: SetKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseId(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            members: keyParameters.members.map(member => Buffer.from(member, 'utf-8'))
        }

        await this.httpClient.post(`/databases/${databaseId}/set?encoding=buffer`, requestBody)
    }

    async addSortedSetKeyApi(keyParameters: SortedSetKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseId(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            members: keyParameters.members.map(member => ({ ...member, name: Buffer.from(member.name, 'utf-8') }))
        }

        await this.httpClient.post(`/databases/${databaseId}/zSet?encoding=buffer`, requestBody)
    }

    async addListKeyApi(keyParameters: ListKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseId(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            element: Buffer.from(keyParameters.element, 'utf-8')
        }

        await this.httpClient.post(`/databases/${databaseId}/list?encoding=buffer`, requestBody)
    }

    async addStringKeyApi(keyParameters: StringKeyParameters, databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseId(databaseParameters.databaseName)
        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            value: Buffer.from(keyParameters.value, 'utf-8')
        }

        await this.httpClient.post(`/databases/${databaseId}/string?encoding=buffer`, requestBody)
    }
}
