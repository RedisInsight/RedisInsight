import {test, expect} from '../fixtures/open-ri'
import {Common} from '../helpers/common'
import {BrowserPage} from '../pageObjects/browser-page'
import {Toast} from '../pageObjects/components/common/toast'

let keyName: string
let browserPage: BrowserPage
let toast: Toast

test.beforeEach(async ({page}) => {
    // await dialogUserAgreement.acceptLicenseTerms()
    // await basePage.getText('sa')
    console.log('WE ARE IN THE BEFORE STEP')
    keyName = Common.generateWord(10)
    browserPage = new BrowserPage(page)
    toast = new Toast(page)
})

test.afterEach(async ({basePage}) => {
    // await dialogUserAgreement.acceptLicenseTerms()
    // await basePage.getText('sa')
    console.log('WE ARE IN THE AFTER STEP')



})

test('basic test', async ({ page}) => {
    // await basePage.click('button')
    // await expect(page.getByTestId('todo-title')).toContainText(['something nice'])
    console.log('WE ARE IN TEST')
    await browserPage.addHashKey(keyName)
    await expect(toast.getNotificationMessage()).toContain('Key has been added')
})
