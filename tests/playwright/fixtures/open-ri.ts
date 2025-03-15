import { test as base } from '@playwright/test'
import BasePage from '../pageObjects/base-page'
import {UserAgreementDialog} from '../pageObjects/user-agreement-dialog'
import {DatabaseAPIRequests} from'../helpers/api/api-databases'
import {apiUrl, ossStandaloneConfig} from "../helpers/conf";

type OpenRedisInsight = {
    basePage: BasePage
    dialogUserAgreement: UserAgreementDialog
    // dbAPI: DatabaseAPIRequests
    apiUrl: string

}

export const test = base.extend<OpenRedisInsight>({

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
        await dbApi.addNewStandaloneDatabaseApi(ossStandaloneConfig)

        // const page = await context.newPage()
        //Navigate to page
        const basePage = new BasePage(page)
        await basePage.navigateToHomeUrl()

        await use(basePage)

    },
    dialogUserAgreement: async ({ page }, use) => {
        const  userAgreementDialog = new UserAgreementDialog(page)
        await userAgreementDialog.acceptLicenseTerms()
        await use(new UserAgreementDialog(page))
    },

})

export { expect } from '@playwright/test'
