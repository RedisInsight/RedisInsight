import { test as base, Page } from '@playwright/test'
import { BasePage } from '../pageObjects/base-page'
import { UserAgreementDialog } from '../pageObjects/dialogs/user-agreement-dialog'
import { DatabaseAPIRequests } from '../helpers/api/api-databases'
import { ossStandaloneConfig } from '../helpers/conf'
import { MyRedisDatabasePage } from '../pageObjects/my-redis-databases-page'
import log from 'node-color-log'

// Define shared worker object
type WorkerSharedState = {
    apiUrl: string;
    dbConfig: typeof ossStandaloneConfig;
    baseUrl: string;
}

// Define test fixture types
type RedisInsight = {
    basePage: Page;
    dialogUserAgreement: UserAgreementDialog;
    workerState: WorkerSharedState; // Worker-scoped object passed to tests
}

// Extend Playwright test
export const test = base.extend<
    RedisInsight,
    { forEachWorker: void; workerState: WorkerSharedState } >({

    // ✅ Worker-scoped shared object
    workerState: [async ({}, use, testInfo) => {
        log.info(`🚀 Setting up worker state for worker ${testInfo.workerIndex}`)

        // Initialize worker-scoped data
        const workerState: WorkerSharedState = {
            apiUrl: testInfo.project.use.apiUrl,
            dbConfig: ossStandaloneConfig,
            baseUrl: testInfo.project.use.baseURL
        }
        log.info(`🏠 Base URL: ${workerState.baseUrl}`)
        log.info(`🌐 API URL: ${workerState.apiUrl}`)
        log.info(`🗄️ Database Config: ${JSON.stringify(workerState.dbConfig)}`)

        await use(workerState)

    }, { scope: 'worker' }], // Worker-scoped fixtures, runs once per worker

    // ✅ Worker-scoped setup/teardown
    forEachWorker: [async ({ workerState }, use) => {
        const ti = base.info().workerIndex
        log.info(`BEFORE Starting test worker ${ti}`)

        // Set up the database before tests
        const dbApi = new DatabaseAPIRequests(workerState.apiUrl)
        await dbApi.addNewStandaloneDatabaseApi(workerState.dbConfig)

        await use() // Run the tests
        // Something failing here doesn't affect test execution result
        log.info(`Stopping test worker ${ti}`)

        // Cleanup after all tests in this worker
        // Delete db
        await dbApi.deleteStandaloneDatabaseApi(workerState.dbConfig)

    }, { scope: 'worker', auto: true }],

    // ✅ Test-scoped `basePage` using worker state
    basePage: async ({ page, workerState }, use) => {
        log.info('Fixture setup: Initializing Base Page')

        // Navigate to home page
        const basePage = new BasePage(page)
        await basePage.navigateToHomeUrl(workerState.baseUrl)

        const userAgreementDialog = new UserAgreementDialog(page)
        await userAgreementDialog.acceptLicenseTerms()


       // Enter DB
        const myDbPage = new MyRedisDatabasePage(page)
        await myDbPage.clickOnDBByName(workerState.dbConfig.databaseName)

        await use(page)
    },


})

export { expect } from '@playwright/test'
