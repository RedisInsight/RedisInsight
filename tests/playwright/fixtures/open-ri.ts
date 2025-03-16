// import { test as base } from '@playwright/test'
// import BasePage from '../pageObjects/base-page'
// import {UserAgreementDialog} from '../pageObjects/user-agreement-dialog'
// import {DatabaseAPIRequests} from'../helpers/api/api-databases'
// import { ossStandaloneConfig} from '../helpers/conf'
// import {MyRedisDatabasePage} from '../pageObjects/my-redis-databases-page'
// import { APIKeyRequests } from '../helpers/api/api-keys'
//
// type OpenRedisInsight = {
//     basePage: BasePage
//     dialogUserAgreement: UserAgreementDialog
//     // dbAPI: DatabaseAPIRequests
//     apiUrl: string
//     dbConfig: typeof ossStandaloneConfig
//     forEachWorker: void
// }
//
// export const test = base.extend< OpenRedisInsight,
//     {
//         forEachWorker: void,
//         apiUrl:string
//         dbConfig: typeof ossStandaloneConfig}>
//     ({
//         dbConfig: async ({}, use) => {
//             console.log('Fixture setup: Assigning database config')
//             await use(ossStandaloneConfig)  // Use the imported object directly
//         },
//         apiUrl: ['default', { option: true }],
//         // dbAPI: async () => {
//         //     const dbApi = new DatabaseAPIRequests(this.apiUrl)
//         //
//         //     await dbApi.addNewStandaloneDatabaseApi(ossStandaloneConfig)
//         // },
//         // context: async ({ browser }, use) => {
//         //     const context = await browser.newContext()
//         //     await context.clearCookies()
//         //     await context.clearPermissions()
//         //     // await context.storageState({ path: 'emptyState.json' })
//         //     await use(context)
//         //     await context.close()
//         // },
//         // basePage: async ({ context  }, use) => {
//         basePage: async ({ page , dbConfig }, use) => {
//
//
//             // const page = await context.newPage()
//             // Navigate to page
//             const basePage = new BasePage(page)
//             await basePage.navigateToHomeUrl()
//
//             const myDbPage = new MyRedisDatabasePage(page)
//             await myDbPage.clickOnDBByName(dbConfig.databaseName)
//
//             await use(basePage)
//
//     },
//     dialogUserAgreement: async ({ page }, use) => {
//         const  userAgreementDialog = new UserAgreementDialog(page)
//         // await userAgreementDialog.acceptLicenseTerms()
//         await use(new UserAgreementDialog(page))
//     },
//     forEachWorker: [async ({ apiUrl, dbConfig }, use) => {
//         // This code runs before all the tests in the worker process.
//         const ti = test.info().workerIndex
//         console.log(`BEFORE Starting test worker ${ti}`)
//         // Set up the fixture.
//         // Add new database
//         const dbApi = new DatabaseAPIRequests(apiUrl)
//         await dbApi.addNewStandaloneDatabaseApi(dbConfig)
//         await use()
//         // This code runs after all the tests in the worker process.
//         console.log(`Stopping test worker ${ti}`)
//         const apiKeyClient = new APIKeyRequests(apiUrl)
//         // apiKeyClient.deleteKeyByNameApi()
//         await dbApi.deleteStandaloneDatabaseApi(dbConfig)
//     }, { auto: true }],  // automatically starts for every worker.
// })
//
// export { expect } from '@playwright/test'

import { test as base, Page } from '@playwright/test'
import BasePage from '../pageObjects/base-page'
import { UserAgreementDialog } from '../pageObjects/dialogs/user-agreement-dialog'
import { DatabaseAPIRequests } from '../helpers/api/api-databases'
import { ossStandaloneConfig } from '../helpers/conf'
import { MyRedisDatabasePage } from '../pageObjects/my-redis-databases-page'
// import { APIKeyRequests } from '../helpers/api/api-keys'

// Define shared worker object
type WorkerSharedState = {
    apiUrl: string;
    dbConfig: typeof ossStandaloneConfig;
    baseUrl: string;
}

// Define test fixture types
type OpenRedisInsight = {
    basePage: Page;
    dialogUserAgreement: UserAgreementDialog;
    workerState: WorkerSharedState; // Worker-scoped object passed to tests
}

// Extend Playwright test
export const test = base.extend<
    OpenRedisInsight,
    { forEachWorker: void; workerState: WorkerSharedState } // Worker-scoped fixtures
>({
    // ✅ Worker-scoped shared object
    workerState: [async ({}, use, testInfo) => {
        console.log(`🚀 Setting up worker state for worker ${testInfo.workerIndex}`)

        // Initialize worker-scoped data
        const workerState: WorkerSharedState = {
            apiUrl: testInfo.project.use.apiUrl,
            dbConfig: ossStandaloneConfig,
            baseUrl: testInfo.project.use.baseURL
        }

        console.log(`🌐 API URL: ${workerState.apiUrl}`)
        console.log(`🗄️ Database Config: ${JSON.stringify(workerState.dbConfig)}`)
        console.log(`🏠 Base URL: ${workerState.baseUrl}`)

        await use(workerState)
    }, { scope: 'worker' }], // Runs once per worker

    // ✅ Worker-scoped setup/teardown
    forEachWorker: [async ({ workerState }, use) => {
        const ti = base.info().workerIndex
        console.log(`BEFORE Starting test worker ${ti}`)

        // Set up the database before tests
        const dbApi = new DatabaseAPIRequests(workerState.apiUrl)
        await dbApi.addNewStandaloneDatabaseApi(workerState.dbConfig)

        await use() // Run the tests
        // Something failing here doesn't affect test execution result
        console.log(`Stopping test worker ${ti}`)

        // Cleanup after all tests in this worker
        // const apiKeyClient = new APIKeyRequests(workerState.apiUrl)
        // await apiKeyClient.deleteKeyByNameApi();
        // throw new Error("test worker error")
        // await dbApi.deleteStandaloneDatabaseApi(workerState.dbConfig)
    }, { scope: 'worker', auto: true }],

    // ✅ Test-scoped `basePage` using worker state
    basePage: async ({ page, workerState }, use) => {
        console.log('Fixture setup: Initializing Base Page')

        // Navigate to home page
        const basePage = new BasePage(page)
        await basePage.navigateToHomeUrl(workerState.baseUrl)

        // Interact with the database UI
        const myDbPage = new MyRedisDatabasePage(page)
        await myDbPage.clickOnDBByName(workerState.dbConfig.databaseName)

        const userAgreementDialog = new UserAgreementDialog(page)
        if(await userAgreementDialog.isUserAgreementDialogVisible()){
            await userAgreementDialog.acceptLicenseTerms()
            await use(userAgreementDialog)
        }

        await use(page)
    },


})

export { expect } from '@playwright/test'
