import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();

const keyName = 'List1testKeyForAddMember';
const keyTTL = '2147476121';
const element = '1111listElement11111';
const element2 = '2222listElement22222';
const element3 = '33333listElement33333';

fixture `List Key verification`
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
test('Verify that user can add element to List', async t => {
    await browserPage.addListKey(keyName, keyTTL);
    //Add element to the List key
    await browserPage.addElementToList(element);
    //Check the added element
    await t.expect(browserPage.listElementsList.withExactText(element).exists).ok('The existence of the list element', { timeout: 20000 });
});
test('Verify that user can select remove List element position: from tail', async t => {
    await browserPage.addListKey(keyName, keyTTL);
    //Add few elements to the List key
    await browserPage.addElementToList(element);
    await browserPage.addElementToList(element2);
    await browserPage.addElementToList(element3);
    //Remove element from the key
    await browserPage.removeListElementFromTail('1');
    //Check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Elements have been removed', 'The notification');
    //Check the removed element is not in the list
    await t.expect(browserPage.listElementsList.withExactText(element3).exists).notOk('The removing of the list element', { timeout: 20000 });
});
test('Verify that user can select remove List element position: from head', async t => {
    await browserPage.addListKey(keyName, keyTTL, element);
    //Add few elements to the List key
    await browserPage.addElementToList(element2);
    await browserPage.addElementToList(element3);
    //Remove element from the key
    await browserPage.removeListElementFromHead('1');
    //Check the notification message
    const notofication = await browserPage.getMessageText();
    await t.expect(notofication).contains('Elements have been removed', 'The notification');
    //Check the removed element is not in the list
    await t.expect(browserPage.listElementsList.withExactText(element).exists).notOk('The removing of the list element', { timeout: 20000 });
});
