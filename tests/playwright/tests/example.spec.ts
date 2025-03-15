import {test, expect} from '../fixtures/open-ri'
import {Common} from '../helpers/common'
import {BrowserPage} from "../pageObjects/browser-page";

let keyName: string
let browserPage: BrowserPage
test.beforeEach(async ({page}) => {
    // await dialogUserAgreement.acceptLicenseTerms()
    // await basePage.getText('sa')
    console.log('WE ARE IN THE BEFORE STEP')
    keyName = Common.generateWord(10)
    browserPage = new BrowserPage(page)
})

test.afterEach(async ({basePage, dialogUserAgreement}) => {
    // await dialogUserAgreement.acceptLicenseTerms()
    // await basePage.getText('sa')
    console.log('WE ARE IN THE AFTER STEP')



})

test('basic test', async ({basePage, page}) => {
    // await basePage.click('button')
    // await expect(page.getByTestId('todo-title')).toContainText(['something nice'])
    console.log('WE ARE IN TEST')
    await browserPage.addHashKey(keyName)
})
