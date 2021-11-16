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

fixture `Hash Key fields verification`
    .meta({ type: 'smoke' })
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
    const keyName = 'Hash1testKeyForAddField';
    const keyTTL = '2147476121';
    const keyFieldValue = 'hashField11111';
    const keyValue = 'hashValue11111!';
test('Verify that user can add field to Hash', async t => {
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
