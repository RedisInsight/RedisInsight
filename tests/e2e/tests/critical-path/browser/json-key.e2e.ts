import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

const keyName = 'JSON1testKey1234566767789890900s';
const keyTTL = '2147476121';
const value = '{"name":"xyz"}';

fixture `JSON Key verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can not add invalid JSON structure inside of created JSON', async t => {
    //Add Json key with json object
    await browserPage.addJsonKey(keyName, keyTTL, value);
    //Check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    await t.click(browserPage.toastCloseButton);
    //Add key with value on the same level
    await browserPage.addJsonKeyOnTheSameLevel('"key1"', '{}');
    //Add invalid JSON structure
    await browserPage.addJsonSctucture('{"name": "Joe", "age": null, }');
    //Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error');
    //Add another invalid JSON structure
    await t.click(browserPage.refreshKeyButton);
    await browserPage.addJsonSctucture('{"name": "Joe", "age": null]');
    //Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error');
    //Add another invalid JSON structure
    await t.click(browserPage.refreshKeyButton);
    await browserPage.addJsonSctucture('{"name": "Joe", "age": null, }');
    //Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error');
});
