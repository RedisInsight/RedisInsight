import { rte } from '../../../helpers/constants';
import { DatabaseHelper } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import { DatabaseAPIRequests } from '../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
let newKeyName = Common.generateWord(10);

fixture `Keys refresh functionality`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can refresh Keys', async t => {
    keyName = Common.generateWord(10);
    const keyTTL = '2147476121';
    newKeyName = Common.generateWord(10);

    // Add hash key
    await browserPage.addHashKey(keyName, keyTTL);
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not found');
    await t.click(browserPage.closeKeyButton);
    // Search for the added key
    await browserPage.searchByKeyName(keyName);
    await t.expect(browserPage.keyNameInTheList.withExactText(keyName).exists).ok('The key is not displayed in the list', { timeout: 10000 });
    // Edit the key name
    await t.click(browserPage.keyNameInTheList);
    await browserPage.editKeyName(newKeyName);
    // Refresh Keys and check
    await t.click(browserPage.refreshKeysButton);
    await browserPage.searchByKeyName(keyName);
    await t.expect(browserPage.keyNameInTheList.withExactText(keyName).exists).notOk('The key is still in the list', { timeout: 10000 });
});
