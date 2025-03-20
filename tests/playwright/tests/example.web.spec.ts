import {test, expect} from '../fixtures/open-ri'
import {Common} from '../helpers/common'
import {BrowserPage} from '../pageObjects/browser-page'
import {APIKeyRequests} from '../helpers/api/api-keys'

let keyName: string
let browserPage: BrowserPage

test.beforeEach(async ({basePage}) => {

    console.log('WE ARE IN THE BEFORE STEP')
    keyName = Common.generateAlphanumeric(10)
    browserPage = new BrowserPage(basePage)

})

test.afterEach(async ({basePage, workerState }) => {
    console.log('WE ARE IN THE AFTER STEP')
    const apiKeyClient = new APIKeyRequests(workerState.apiUrl)
    await apiKeyClient.deleteKeyByNameApi(keyName, workerState.dbConfig.databaseName)

})

test('basic test', async ({basePage}) => {

    console.log('WE ARE IN TEST')
    await browserPage.addHashKey(keyName)

    // checks that the notification is displayed (should be in a different test)
    await expect(await basePage.getByText('Key has been added')).toBeVisible()

    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName)
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName)
    await expect(isKeyIsDisplayedInTheList).toBe(true)

})
