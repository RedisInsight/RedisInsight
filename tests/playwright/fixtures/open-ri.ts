import { test as base } from '@playwright/test'
import BasePage from '../pageObjects/base-page'
import {UserAgreementDialog} from '../pageObjects/user-agreement-dialog'
import {DatabaseAPIRequests} from'../helpers/api/api-databases'
import { ossStandaloneConfig} from '../helpers/conf'
import {MyRedisDatabasePage} from '../pageObjects/my-redis-databases-page'

type OpenRedisInsight = {
    basePage: BasePage
    dialogUserAgreement: UserAgreementDialog
    // dbAPI: DatabaseAPIRequests
    apiUrl: string
    dbConfig: typeof ossStandaloneConfig
    forEachWorker: void
}

export const test = base.extend<OpenRedisInsight,  { forEachWorker: void }>({
    dbConfig: async ({}, use) => {
        console.log('Fixture setup: Assigning database config')
        await use(ossStandaloneConfig)  // Use the imported object directly
    },
    apiUrl: ['default', { option: true }],
    // dbAPI: async () => {
    //     const dbApi = new DatabaseAPIRequests(this.apiUrl)
    //
    //     await dbApi.addNewStandaloneDatabaseApi(ossStandaloneConfig)
    // },
    // context: async ({ browser }, use) => {
    //     const context = await browser.newContext()
    //     await context.clearCookies()
    //     await context.clearPermissions()
    //     // await context.storageState({ path: 'emptyState.json' })
    //     await use(context)
    //     await context.close()
    // },
    // basePage: async ({ context  }, use) => {
    basePage: async ({ page , dbConfig, apiUrl }, use) => {
        // Set up the fixture.
        // Add new database
        const dbApi = new DatabaseAPIRequests(apiUrl)
        await dbApi.addNewStandaloneDatabaseApi(dbConfig)

        // const page = await context.newPage()
        // Navigate to page
        const basePage = new BasePage(page)
        await basePage.navigateToHomeUrl()

        const myDbPage = new MyRedisDatabasePage(page)
        await myDbPage.clickOnDBByName(dbConfig.databaseName)

        await use(basePage)

    },
    dialogUserAgreement: async ({ page }, use) => {
        const  userAgreementDialog = new UserAgreementDialog(page)
        await userAgreementDialog.acceptLicenseTerms()
        await use(new UserAgreementDialog(page))
    },
    forEachWorker: [async ({}, use) => {
        // This code runs before all the tests in the worker process.
        console.log(`BEFORE Starting test worker ${test.info().workerIndex}`)
        await use()
        // This code runs after all the tests in the worker process.
        console.log(`Stopping test worker ${test.info().workerIndex}`)
    }, { scope: 'worker', auto: true }],  // automatically starts for every worker.
})

export { expect } from '@playwright/test'
