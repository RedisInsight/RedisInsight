import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `JSON Key verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await browserPage.deleteKey();
    })
    const keyName = 'JSON1testKey1234566767789890900s';
    const keyTTL = '2147476121';
    const value = '{"name":"xyz"}';
test('Verify that user can not add invalid JSON structure inside of created JSON', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
