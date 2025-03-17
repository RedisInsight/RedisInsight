import {test, expect} from '../fixtures/electron'
// import {Common} from '../helpers/common'
import {BrowserPage} from '../pageObjects/browser-page'
import {UserAgreementDialog} from '../pageObjects/dialogs/user-agreement-dialog'
import {updateControlNumber} from '../helpers/electron/insights'
import {RedisOverviewPage} from '../helpers/constants'
import {RdiInstancesListPage} from '../pageObjects/rdi-instances-list-page'
// import {APIKeyRequests} from "../helpers/api/api-keys";

let keyName: string
let browserPage: BrowserPage
let userAgreementDialog: UserAgreementDialog
let rdiInstancesListPage : RdiInstancesListPage
test.beforeEach(async ({electronPage, workerState}) => {

    rdiInstancesListPage = new RdiInstancesListPage(electronPage)
    userAgreementDialog = new UserAgreementDialog(electronPage)

    await userAgreementDialog.acceptLicenseTerms()
    await updateControlNumber(48.2, electronPage, workerState.apiUrl)
// Open default databases list tab if RDI opened
    if (await rdiInstancesListPage.elementExistsLocator(rdiInstancesListPage.addRdiInstanceButton)) {
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase)
    }

    // keyName = Common.generateAlpanumeric(10)
    // browserPage = new BrowserPage(basePage)


})

test.afterEach(async ({electronApp}) => {
    console.log('WE ARE IN THE AFTER STEP')
    // const apiKeyClient = new APIKeyRequests(workerState.apiUrl)
    // await apiKeyClient.deleteKeyByNameApi(keyName, workerState.dbConfig.databaseName)

})

test('basic test', async ({}) => {

    console.log('WE ARE IN TEST')
    // await browserPage.addHashKey(keyName)
    //
    // // checks that the notification is displayed (should be in a different test)
    // await expect(await basePage.getByText('Key has been added')).toBeVisible()
    //
    //
    // // Check that new key is displayed in the list
    // await browserPage.searchByKeyName(keyName)
    // const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName)
    // await expect(isKeyIsDisplayedInTheList).toBe(true)



})
