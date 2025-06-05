/* eslint-disable no-empty-pattern */
import { Common } from '../helpers/common'
import { BrowserPage } from '../pageObjects/browser-page'
import { DatabaseHelper } from '../helpers/database'
import { APIKeyRequests } from '../helpers/api/api-keys'
import { DatabaseAPIRequests } from '../helpers/api/api-databases'
import { test, expect } from '../fixtures/test'
import { ossStandaloneConfig } from '../helpers/conf'

let keyName: string
let browserPage: BrowserPage
let databaseHelper: DatabaseHelper

test.beforeEach(async ({ page }, testInfo) => {
    // await electronPage.getByText('Add Redis').click()
    browserPage = new BrowserPage(page)
    databaseHelper = new DatabaseHelper(page, testInfo.project.use.apiUrl)
    await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(
        ossStandaloneConfig,
        page,
        testInfo.project.use.apiUrl,
    )
    keyName = Common.generateAlphanumeric(5)
})

test.afterEach(async ({}, testInfo) => {
    const apiKeyClient = new APIKeyRequests(testInfo.project.use.apiUrl)
    const dbApi = new DatabaseAPIRequests(testInfo.project.use.apiUrl)

    await apiKeyClient.deleteKeyByNameApi(
        keyName,
        ossStandaloneConfig.databaseName,
        await browserPage.getWindowId(),
    )
    await dbApi.deleteStandaloneDatabaseApi(
        ossStandaloneConfig,
        await browserPage.getWindowId(),
    )
})

test('basic test', async () => {
    await browserPage.addHashKey(keyName)

    // checks that the notification is displayed (should be in a different test)
    await expect(
        await browserPage.page.getByText('Key has been added'),
    ).toBeVisible()

    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName)
    const isKeyIsDisplayedInTheList =
        await browserPage.isKeyIsDisplayedInTheList(keyName)
    await expect(isKeyIsDisplayedInTheList).toBe(true)
})
