import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
let keyNames = [];

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
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Clear and delete database
        for(const name of keyNames) {
            await browserPage.deleteKeyByName(name);
        }
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see List of Keys in DB', async t => {
        keyNames = [
            `key-${chance.word({ length: 10 })}`,
            `key-${chance.word({ length: 10 })}`,
            `key-${chance.word({ length: 10 })}`,
            `key-${chance.word({ length: 10 })}`
        ];
        await browserPage.addStringKey(keyNames[0]);
        await browserPage.addHashKey(keyNames[1]);
        await browserPage.addListKey(keyNames[2]);
        await browserPage.addStringKey(keyNames[3]);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(browserPage.keyNameInTheList.exists).ok('The list of keys is displayed');
    });
test
    .meta({ rte: rte.standalone })
    .after(async () => {
        //Clear and delete database
        for(const name of keyNames) {
            await browserPage.deleteKeyByName(name);
        }
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can scroll List of Keys in DB', async t => {
        keyNames = [
            `key-${chance.word({ length: 10 })}`,
            `key-${chance.word({ length: 10 })}`,
            `key-${chance.word({ length: 10 })}`,
            `key-${chance.word({ length: 10 })}`
        ];
        await browserPage.addStringKey(keyNames[0]);
        await browserPage.addHashKey(keyNames[1]);
        await browserPage.addListKey(keyNames[2]);
        await browserPage.addStringKey(keyNames[3]);
        await t.click(browserPage.refreshKeysButton);
        //Scroll to the key element
        await t.hover(browserPage.keyNameInTheList);
        await t.expect(browserPage.keyNameInTheList.exists).ok;
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can refresh Keys', async t => {
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can open key details', async t => {
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
