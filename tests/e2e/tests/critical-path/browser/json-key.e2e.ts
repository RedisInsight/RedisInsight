import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const browserPage = new BrowserPage();

let keyName = Common.generateWord(10);
const keyTTL = '2147476121';
const value = '{"name":"xyz"}';

fixture `JSON Key verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can not add invalid JSON structure inside of created JSON', async t => {
    keyName = Common.generateWord(10);
    // Add Json key with json object
    await browserPage.addJsonKey(keyName, value, keyTTL);
    // Check the notification message
    const notification = await browserPage.getMessageText();
    await t.expect(notification).contains('Key has been added', 'The notification');
    await t.click(browserPage.toastCloseButton);
    // Add key with value on the same level
    await browserPage.addJsonKeyOnTheSameLevel('"key1"', '{}');
    // Add invalid JSON structure
    await browserPage.addJsonStructure('{"name": "Joe", "age": null, }');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error not displayed');
    // Add another invalid JSON structure
    await t.click(browserPage.refreshKeyButton);
    await browserPage.addJsonStructure('{"name": "Joe", "age": null]');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error not displayed');
    // Add another invalid JSON structure
    await t.click(browserPage.refreshKeyButton);
    await browserPage.addJsonStructure('{"name": "Joe", "age": null, }');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error not displayed');
});
