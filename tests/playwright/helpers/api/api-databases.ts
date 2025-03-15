// import { sendPostRequest } from './api-common'
// import { AddNewDatabaseParameters } from '../../pageObjects/dialogs/add-redis-database-dialog'
// import { ResourcePath } from '../constants'
// import {faker} from "@faker-js/faker"
//
//
// export class DatabaseAPIRequests {
//     /**
//      * Add a new Standalone database through api using host and port
//      * @param databaseParameters The database parameters
//      */
//     async addNewStandaloneDatabaseApi(
//         databaseParameters: AddNewDatabaseParameters, isCloud = false
//     ): Promise<void> {
//         const uniqueId = faker.string.alphanumeric({ length: 10 })
//         const uniqueIdNumber = faker.number.int({ min: 1, max: 1000 })
//         const requestBody: {
//             name?: string,
//             host: string,
//             port: number,
//             username?: string,
//             password?: string,
//             tls?: boolean,
//             verifyServerCert?: boolean,
//             caCert?: {
//                 name: string,
//                 certificate?: string
//             },
//             clientCert?: {
//                 name: string,
//                 certificate?: string,
//                 key?: string
//             },
//             cloudDetails?: {
//                 cloudId: number,
//                 subscriptionType: string,
//                 planMemoryLimit: number,
//                 memoryLimitMeasurementUnit: string,
//                 free: boolean
//             }
//         } = {
//             name: databaseParameters.databaseName,
//             host: databaseParameters.host,
//             port: Number(databaseParameters.port),
//             username: databaseParameters.databaseUsername,
//             password: databaseParameters.databasePassword
//         }
//
//         if (databaseParameters.caCert) {
//             requestBody.tls = true
//             requestBody.verifyServerCert = false
//             requestBody.caCert = {
//                 name: `ca}-${uniqueId}`,
//                 certificate: databaseParameters.caCert.certificate
//             }
//             requestBody.clientCert = {
//                 name: `client}-${uniqueId}`,
//                 certificate: databaseParameters.clientCert!.certificate,
//                 key: databaseParameters.clientCert!.key
//             }
//         }
//
//         if(isCloud) {
//             requestBody.cloudDetails = {
//                 cloudId: uniqueIdNumber,
//                 subscriptionType: 'fixed',
//                 planMemoryLimit: 30,
//                 memoryLimitMeasurementUnit: 'mb',
//                 free: true
//             }
//         }
//         const response = await sendPostRequest(
//             ResourcePath.Databases,
//             requestBody
//         )
//         await t
//             .expect(await response.body.name)
//             .eql(
//                 databaseParameters.databaseName,
//                 `Database Name is not equal to ${databaseParameters.databaseName} in response`
//             )
//         await t.expect(await response.status).eql(201)
//     }
//
// }
import { faker } from '@faker-js/faker'
import { HttpClient } from './http-client'
import { AddNewDatabaseParameters } from '../../pageObjects/dialogs/add-redis-database-dialog'
import { ResourcePath } from '../constants'

export class DatabaseAPIRequests {
    private httpClient: HttpClient

    constructor(baseURL: string) {
        this.httpClient = new HttpClient(baseURL)
    }

    /**
     * Add a new standalone database using the HTTP client.
     * @param databaseParameters The database parameters
     * @param isCloud Whether the database is cloud-based
     */
    async addNewStandaloneDatabaseApi(
        databaseParameters: AddNewDatabaseParameters,
        isCloud = false
    ): Promise<void> {
        const uniqueId = faker.string.alphanumeric({ length: 10 })
        const uniqueIdNumber = faker.number.int({ min: 1, max: 1000 })

        const requestBody: any = {
            name: databaseParameters.databaseName,
            host: databaseParameters.host,
            port: Number(databaseParameters.port),
            username: databaseParameters.databaseUsername,
            password: databaseParameters.databasePassword,
        }

        if (databaseParameters.caCert && databaseParameters.clientCert) {
            requestBody.tls = true
            requestBody.verifyServerCert = false
            requestBody.caCert = {
                name: `ca-${uniqueId}`,
                certificate: databaseParameters.caCert.certificate,
            }
            requestBody.clientCert = {
                name: `client-${uniqueId}`,
                certificate: databaseParameters.clientCert.certificate,
                key: databaseParameters.clientCert.key,
            }
        }

        if (isCloud) {
            requestBody.cloudDetails = {
                cloudId: uniqueIdNumber,
                subscriptionType: 'fixed',
                planMemoryLimit: 100,
                memoryLimitMeasurementUnit: 'mb',
                free: true,
            }
        }

        const response = await this.httpClient.post<any>(ResourcePath.Databases, requestBody)

        if (!response || Object.keys(response).length === 0) {
            throw new Error('The response body is empty')
        }

        if (response.name !== databaseParameters.databaseName) {
            throw new Error(
                `Database name mismatch. Expected: ${databaseParameters.databaseName}, Received: ${response.name}`
            )
        }

        console.log('Database created successfully:', response)
    }
}
