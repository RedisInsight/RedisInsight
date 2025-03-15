import { test as base } from '@playwright/test'
import BasePage from '../pageObjects/base-page'
import {UserAgreementDialog} from '../pageObjects/user-agreement-dialog'
import {DatabaseAPIRequests} from'../helpers/api/api-databases'
import {apiUrl, ossStandaloneConfig} from '../helpers/conf'
import {MyRedisDatabasePage} from '../pageObjects/my-redis-databases-page'

type OpenRedisInsight = {
    basePage: BasePage
    dialogUserAgreement: UserAgreementDialog
    // dbAPI: DatabaseAPIRequests
    apiUrl: string
    dbConfig: object

}

export const test = base.extend<OpenRedisInsight>({
    dbConfig: async ({page}, use) => {
        use(ossStandaloneConfig)
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
    basePage: async ({ page  }, use) => {
        // Set up the fixture.
        // Add new database
        const dbApi = new DatabaseAPIRequests(apiUrl)
        await dbApi.addNewStandaloneDatabaseApi(dbCon)

        // const page = await context.newPage()
        // Navigate to page
        const basePage = new BasePage(page)
        await basePage.navigateToHomeUrl()

        const myDbPage = new MyRedisDatabasePage(page)
        await myDbPage.clickOnDBByName(ossStandaloneConfig.databaseName)

        await use(basePage)

    },
    dialogUserAgreement: async ({ page }, use) => {
        const  userAgreementDialog = new UserAgreementDialog(page)
        await userAgreementDialog.acceptLicenseTerms()
        await use(new UserAgreementDialog(page))
    },

})

export { expect } from '@playwright/test'
