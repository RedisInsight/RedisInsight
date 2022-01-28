import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
let keyName1 = chance.word({ length: 10 });
let keyName2 = chance.word({ length: 10 });
let keyName3 = chance.word({ length: 10 });
let keyName4 = chance.word({ length: 10 });

fixture `List of keys verifications`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName1);
        await browserPage.deleteKeyByName(keyName2);
        await browserPage.deleteKeyByName(keyName3);
        await browserPage.deleteKeyByName(keyName4);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see List of Keys in DB', async t => {
        keyName1 = chance.word({ length: 10 });
        keyName2 = chance.word({ length: 10 });
        keyName3 = chance.word({ length: 10 });
        keyName4 = chance.word({ length: 10 });
        await browserPage.addStringKey(keyName1);
        await browserPage.addHashKey(keyName2);
        await browserPage.addListKey(keyName3);
        await browserPage.addStringKey(keyName4);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(browserPage.keyNameInTheList.exists).ok('The list of keys is displayed');
    });
test
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName1);
        await browserPage.deleteKeyByName(keyName2);
        await browserPage.deleteKeyByName(keyName3);
        await browserPage.deleteKeyByName(keyName4);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can scroll List of Keys in DB', async t => {
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
    keyName = chance.word({ length: 10 });
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
    keyName = chance.word({ length: 10 });
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
