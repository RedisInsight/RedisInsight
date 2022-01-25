import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

const keyName1 = 'keyName1';
const keyName2 = 'keyName2';
const keyName3 = 'keyName3';
const keyName4 = 'keyName4';

fixture `List of keys verifications`
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
test('Verify that user can see List of Keys in DB', async t => {
    await browserPage.addStringKey(keyName1);
    await browserPage.addHashKey(keyName2);
    await browserPage.addListKey(keyName3);
    await browserPage.addStringKey(keyName4);
    await t.click(browserPage.refreshKeysButton);
    await t.expect(browserPage.keyNameInTheList.exists).ok('The list of keys is displayed');
});
test('Verify that user can scroll List of Keys in DB', async t => {
    await browserPage.addStringKey(keyName1);
    await browserPage.addHashKey(keyName2);
    await browserPage.addListKey(keyName3);
    await browserPage.addStringKey(keyName4);
    await t.click(browserPage.refreshKeysButton);
    //Scroll to the key element
    await t.hover(browserPage.keyNameInTheList);
    await t.expect(browserPage.keyNameInTheList.exists).ok;
});
test('Verify that user can refresh Keys', async t => {
    const keyName = 'Hash1testKey';
    const keyTTL = '2147476121';
    const newKeyName = 'KeyNameAfterEdit!testKey';

    //add hash key
    await browserPage.addHashKey(keyName, keyTTL);
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    await t.click(browserPage.closeKeyButton);
    //search for the added   key
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).eql(true, 'The key is in the list');
    //edit the key name in details
    await t.click(browserPage.keyNameInTheList);
    await browserPage.editKeyName(newKeyName);
    //refresh Keys
    await t.click(browserPage.refreshKeysButton);
    await browserPage.searchByKeyName(keyName);
    const isKeyIsNotDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsNotDisplayedInTheList).eql(false, 'The key is not in the list');
});
test('Verify that user can open key details', async t => {
    const keyName = 'String1testKey';
    const keyTTL = '2147476121';
    const keyValue = 'StringValue!';

    //add String key
    await browserPage.addStringKey(keyName, keyTTL, keyValue);
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Key has been added', 'The notification');
    await t.click(browserPage.closeKeyButton);
    //search for the added key
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is in the list');
    //open the key details
    await t.click(browserPage.keyNameInTheList);
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key details is opened');
});
