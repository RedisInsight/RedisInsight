import { test as base } from '@playwright/test'
import BasePage from '../pageObjects/base-page'
import {UserAgreementDialog} from "../pageObjects/user-agreement-dialog";

type OpenRedisInsight = {
    basePage: BasePage;
    dialogUserAgreement: UserAgreementDialog;
}

export const test = base.extend<OpenRedisInsight>({

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

        // const page = await context.newPage()
        // Set up the fixture.
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
