import { faker } from '@faker-js/faker'
import {AxiosInstance} from 'axios'
import { HttpClient } from './http-client'
import { AddNewDatabaseParameters,  databaseParameters } from '../../types'
import { ResourcePath } from '../constants'
import { asyncFilter, doAsyncStuff } from '../async-helper'

export class DatabaseAPIRequests {

    private apiClient: AxiosInstance

    constructor(apiUrl: string) {
        this.apiClient = new HttpClient(apiUrl).getClient()
    }

    async addNewStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters, isCloud = false, xWindowsId: string): Promise<void> {
        const uniqueId = faker.string.alphanumeric({ length: 10 })
        const uniqueIdNumber = faker.number.int({ min: 1, max: 1000 })
        const requestBody: any = {
            name: databaseParameters.databaseName,
            host: databaseParameters.host,
            port: Number(databaseParameters.port),
            username: databaseParameters.databaseUsername,
            password: databaseParameters.databasePassword
        }

        if (databaseParameters.caCert) {
            requestBody.tls = true
            requestBody.verifyServerCert = false
            requestBody.caCert = {
                name: `ca-${uniqueId}`,
                certificate: databaseParameters.caCert.certificate
            }
            requestBody.clientCert = {
                name: `client-${uniqueId}`,
                certificate: databaseParameters.clientCert!.certificate,
                key: databaseParameters.clientCert!.key
            }
        }

        if (isCloud) {
            requestBody.cloudDetails = {
                cloudId: uniqueIdNumber,
                subscriptionType: 'fixed',
                planMemoryLimit: 30,
                memoryLimitMeasurementUnit: 'mb',
                free: true
            }
        }

        const response = await this.apiClient.post(ResourcePath.Databases, requestBody,
            {headers:{
                'X-Window-Id': xWindowsId
            }
        })
        if (response.status !== 201) throw new Error(`Database creation failed for ${databaseParameters.databaseName}`)
    }

    async getAllDatabases(): Promise<string[]> {
        const response = await this.apiClient.get(ResourcePath.Databases)
        if (response.status !== 200) throw new Error('Failed to retrieve databases')
        return response.data
    }

    async getDatabaseIdByName(databaseName?: string): Promise<string> {
        if (!databaseName) throw new Error('Error: Missing databaseName')

        const allDatabases = await this.getAllDatabases()
        const filteredDb = await asyncFilter(allDatabases, async (item: databaseParameters) => {
            await doAsyncStuff()
            return item.name === databaseName
        })

        if (filteredDb.length === 0) throw new Error(`Database ${databaseName} not found`)
        return filteredDb[0].id
    }

    async deleteStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters): Promise<void> {
        const databaseId = await this.getDatabaseIdByName(databaseParameters.databaseName)
        if (!databaseId) throw new Error('Error: Missing databaseId')

        const requestBody = { ids: [databaseId] }
        const response = await this.apiClient.delete(ResourcePath.Databases, { data: requestBody })
        if (response.status !== 200) throw new Error(`Failed to delete database ${databaseParameters.databaseName}`)
    }
}

