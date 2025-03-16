//
// import { faker } from '@faker-js/faker'
// import { HttpClient } from './http-client'
// import { AddNewDatabaseParameters } from '../../pageObjects/dialogs/add-redis-database-dialog'
// import { ResourcePath } from '../constants'
//
// export class DatabaseAPIRequests {
//     private httpClient: HttpClient
//
//     constructor(baseURL: string) {
//         this.httpClient = new HttpClient(baseURL)
//     }
//
//     /**
//      * Add a new standalone database using the HTTP client.
//      * @param databaseParameters The database parameters
//      * @param isCloud Whether the database is cloud-based
//      */
//     async addNewStandaloneDatabaseApi(
//         databaseParameters: AddNewDatabaseParameters,
//         isCloud = false
//     ): Promise<void> {
//         const uniqueId = faker.string.alphanumeric({ length: 10 })
//         const uniqueIdNumber = faker.number.int({ min: 1, max: 1000 })
//
//         const requestBody: any = {
//             name: databaseParameters.databaseName,
//             host: databaseParameters.host,
//             port: Number(databaseParameters.port),
//             username: databaseParameters.databaseUsername,
//             password: databaseParameters.databasePassword,
//         }
//
//         if (databaseParameters.caCert && databaseParameters.clientCert) {
//             requestBody.tls = true
//             requestBody.verifyServerCert = false
//             requestBody.caCert = {
//                 name: `ca-${uniqueId}`,
//                 certificate: databaseParameters.caCert.certificate,
//             }
//             requestBody.clientCert = {
//                 name: `client-${uniqueId}`,
//                 certificate: databaseParameters.clientCert.certificate,
//                 key: databaseParameters.clientCert.key,
//             }
//         }
//
//         if (isCloud) {
//             requestBody.cloudDetails = {
//                 cloudId: uniqueIdNumber,
//                 subscriptionType: 'fixed',
//                 planMemoryLimit: 100,
//                 memoryLimitMeasurementUnit: 'mb',
//                 free: true,
//             }
//         }
//
//         const response = await this.httpClient.post<any>(ResourcePath.Databases, requestBody)
//
//         if (!response || Object.keys(response).length === 0) {
//             throw new Error('The response body is empty')
//         }
//
//         if (response.name !== databaseParameters.databaseName) {
//             throw new Error(
//                 `Database name mismatch. Expected: ${databaseParameters.databaseName}, Received: ${response.name}`
//             )
//         }
//
//         console.log('Database created successfully:', response)
//     }
// }
import { faker } from '@faker-js/faker'
import axios from 'axios'
import { Chance } from 'chance'
import { HttpClient } from './http-client'
import { AddNewDatabaseParameters, OSSClusterParameters,  ClusterNodes, databaseParameters } from '../../types'
import { ResourcePath } from '../constants'

// export class DatabaseAPIRequests {
//     private httpClient: HttpClient
//
//     constructor(baseURL: string) {
//         this.httpClient = new HttpClient(baseURL)
//     }
//
//     async addNewStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters, isCloud = false): Promise<void> {
//         const uniqueId = faker.string.alphanumeric({ length: 10 })
//         const uniqueIdNumber = faker.number.int({ min: 1, max: 1000 })
//
//         const requestBody: any = {
//             name: databaseParameters.databaseName,
//             host: databaseParameters.host,
//             port: Number(databaseParameters.port),
//             username: databaseParameters.databaseUsername,
//             password: databaseParameters.databasePassword,
//         }
//
//         if (databaseParameters.caCert && databaseParameters.clientCert) {
//             requestBody.tls = true
//             requestBody.verifyServerCert = false
//             requestBody.caCert = {
//                 name: `ca-${uniqueId}`,
//                 certificate: databaseParameters.caCert.certificate,
//             }
//             requestBody.clientCert = {
//                 name: `client-${uniqueId}`,
//                 certificate: databaseParameters.clientCert.certificate,
//                 key: databaseParameters.clientCert.key,
//             }
//         }
//
//         if (isCloud) {
//             requestBody.cloudDetails = {
//                 cloudId: uniqueIdNumber,
//                 subscriptionType: 'fixed',
//                 planMemoryLimit: 100,
//                 memoryLimitMeasurementUnit: 'mb',
//                 free: true,
//             }
//         }
//
//         const response = await this.httpClient.post<any>(ResourcePath.Databases, requestBody)
//
//         if (!response || Object.keys(response).length === 0) {
//             throw new Error('The response body is empty')
//         }
//
//         if (response.name !== databaseParameters.databaseName) {
//             throw new Error(`Database name mismatch. Expected: ${databaseParameters.databaseName}, Received: ${response.name}`)
//         }
//     }
//
//     async getAllDatabases(): Promise<databaseParameters[]> {
//         return this.httpClient.get<databaseParameters[]>(ResourcePath.Databases)
//     }
//
//     async getDatabaseIdByName(databaseName?: string): Promise<string> {
//         if (!databaseName) throw new Error('Error: Missing databaseName')
//
//         const allDatabases = await this.getAllDatabases()
//         const db = allDatabases.find(db => db.name === databaseName)
//         if (!db) throw new Error(`Database ${databaseName} not found`)
//
//         return db.id
//     }
//
//     async deleteStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters): Promise<void> {
//         const databaseId = await this.getDatabaseIdByName(databaseParameters.databaseName)
//         if (!databaseId) throw new Error('Error: Missing databaseId')
//
//         await this.httpClient.delete(ResourcePath.Databases, { ids: [`${databaseId}`] })
//     }
//
//     async deleteAllDatabasesApi(): Promise<void> {
//         const allDatabases = await this.getAllDatabases()
//         const databaseIds = allDatabases.map(db => db.id)
//
//         if (databaseIds.length) {
//             await this.httpClient.delete(ResourcePath.Databases, { ids: databaseIds })
//             await this.deleteAllDatabasesByConnectionTypeApi('SENTINEL')
//         }
//     }
//
//     async deleteAllDatabasesByConnectionTypeApi(connectionType: string): Promise<void> {
//         const allDatabases = await this.getAllDatabases()
//         const databaseIds = allDatabases.filter(db => db.connectionType === connectionType).map(db => db.id)
//
//         if (databaseIds.length) {
//             await this.httpClient.delete(ResourcePath.Databases, { ids: databaseIds })
//         }
//     }
//
//     async getClusterNodesApi(databaseParameters: OSSClusterParameters): Promise<string[]> {
//         const databaseId = await this.getDatabaseIdByName(databaseParameters.ossClusterDatabaseName)
//         const resourcePath = `${ResourcePath.Databases}/${databaseId}${ResourcePath.ClusterDetails}`
//         const response = await this.httpClient.get<{ nodes: ClusterNodes[] }>(resourcePath)
//
//         return response.nodes.map(node => `${node.host}:${node.port}`)
//     }
// }

import { asyncFilter, doAsyncStuff } from '../async-helper'

const apiUrl = 'https://localhost:5540/api'



const apiClient = axios.create({
    baseURL: apiUrl, // Change to your API base URL
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false // Allows self-signed/invalid SSL certs
    })
})

// Enable logging if DEBUG=1 is set
if (process.env.DEBUG === '1') {
    apiClient.interceptors.request.use(request => {
        console.log('Starting Request', request)
        return request
    })

    apiClient.interceptors.response.use(response => {
        console.log('Response:', response)
        return response
    }, error => {
        console.error('Error Response:', error.response)
        return Promise.reject(error)
    })
}

export class DatabaseAPIRequests {
    async addNewStandaloneDatabaseApi(databaseParameters: AddNewDatabaseParameters, isCloud = false): Promise<void> {
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

        const response = await apiClient.post(ResourcePath.Databases, requestBody)
        if (response.status !== 201) throw new Error(`Database creation failed for ${databaseParameters.databaseName}`)
    }

    async getAllDatabases(): Promise<string[]> {
        const response = await apiClient.get(ResourcePath.Databases)
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
        const response = await apiClient.delete(ResourcePath.Databases, { data: requestBody })
        if (response.status !== 200) throw new Error(`Failed to delete database ${databaseParameters.databaseName}`)
    }
}

