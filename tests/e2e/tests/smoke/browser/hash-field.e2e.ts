import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const keyFieldValue = 'hashField11111';
const keyValue = 'hashValue11111!';

fixture `Hash Key fields verification`
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
test('Verify that user can add field to Hash', async t => {
    keyName = chance.string({ length: 10 });
    await browserPage.addHashKey(keyName, keyTTL);
    //Add field to the hash key
    await browserPage.addFieldToHash(keyFieldValue, keyValue);
    //Search the added field
    await browserPage.searchByTheValueInKeyDetails(keyFieldValue);
    //Check the added field
    await t.expect(browserPage.hashValuesList.withExactText(keyValue).exists).ok('The existence of the value', { timeout: 20000 });
    await t.expect(browserPage.hashFieldsList.withExactText(keyFieldValue).exists).ok('The existence of the field', { timeout: 20000 });
});
test('Verify that user can remove field from Hash', async t => {
    keyName = chance.string({ length: 10 });
    await browserPage.addHashKey(keyName, keyTTL);
    //Add field to the hash key
    await browserPage.addFieldToHash(keyFieldValue, keyValue);
    //Search the added field
    await browserPage.searchByTheValueInKeyDetails(keyFieldValue);
    //Remove field from Hash
    await t.click(browserPage.removeButton);
    await t.click(browserPage.confirmRemoveHashFieldButton);
    //Check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Field has been removed', 'The notification');
});
