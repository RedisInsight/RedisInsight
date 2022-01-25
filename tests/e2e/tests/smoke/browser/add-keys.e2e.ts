import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

fixture `Add keys`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can add Hash Key', async t => {
    const keyName = 'hashTestKey12345qwe';
    //add Hash key
    await browserPage.addHashKey(keyName);
    //check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    //check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
});
test('Verify that user can add Set Key', async t => {
    const keyName = '1111111111111111111setTestKey1234';
    //add Set key
    await browserPage.addSetKey(keyName);
    //check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    //check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
});
test('Verify that user can add List Key', async t => {
    const keyName = '22listTestKey1';
    //add List key
    await browserPage.addListKey(keyName);
    //check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    //check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
});
test('Verify that user can add String Key', async t => {
    const keyName = '1234567890testkestringytrtest1111';
    //add String key
    await browserPage.addStringKey(keyName);
    //check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    //check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
});
test('Verify that user can add ZSet Key', async t => {
    const keyName = 'ZsetTestKey1234567';
    //add ZSet key
    await browserPage.addZSetKey(keyName, '111');
    //check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    //check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
});
test('Verify that user can add JSON Key', async t => {
    const keyName = 'JSON1234567891';
    const keyTTL = '2147476121';
    const value = '{"name":"xyz"}';
    //add JSON key
    await browserPage.addJsonKey(keyName, keyTTL, value);
    //check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    //check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is added');
});
