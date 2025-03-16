import {test, expect} from '../fixtures/open-ri'
import {Common} from '../helpers/common'
import {BrowserPage} from '../pageObjects/browser-page'
import {Toast} from '../pageObjects/components/common/toast'

let keyName: string
let browserPage: BrowserPage


test.beforeEach(async ({basePage}) => {

    console.log('WE ARE IN THE BEFORE STEP')
    keyName = Common.generateWord(10)
    browserPage = new BrowserPage(basePage)

})

test.afterEach(async ({basePage}) => {

    console.log('WE ARE IN THE AFTER STEP')



})

test('basic test', async ({ basePage}) => {

    console.log('WE ARE IN TEST')
    await browserPage.addHashKey(keyName)
    // checks that the notification is displayed
    await expect(await basePage.getByText('Key has been added')).toBeVisible()


})
