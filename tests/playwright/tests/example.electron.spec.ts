import {test, expect} from '../fixtures/simple-slectron'
import {Common} from '../helpers/common'
import {BrowserPage} from '../pageObjects/browser-page'
import {DatabaseHelper} from "../helpers/database";
import {APIKeyRequests} from "../helpers/api/api-keys";

let keyName: string
let browserPage: BrowserPage
let databaseHelper: DatabaseHelper

test.beforeEach(async ({electronPage, workerState}) => {

    // await electronPage.getByText('Add Redis').click()
    browserPage = new BrowserPage(electronPage)
    databaseHelper = new DatabaseHelper(electronPage, workerState.apiUrl)
    await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(workerState.dbConfig, electronPage, workerState.apiUrl)
    keyName = Common.generateAlphanumeric(5)
})

test.afterEach(async ({electronApp, workerState}) => {

    const apiKeyClient = new APIKeyRequests(workerState.apiUrl)

    await apiKeyClient.deleteKeyByNameApi(keyName, workerState.dbConfig.databaseName, await browserPage.getWindowId())
    await workerState.electronApp.close()

})

test('basic test', async ({workerState}) => {


    await browserPage.addHashKey(keyName)

    // checks that the notification is displayed (should be in a different test)
    await expect(await browserPage.page.getByText('Key has been added')).toBeVisible()


    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName)
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName)
    await expect(isKeyIsDisplayedInTheList).toBe(true)



})

