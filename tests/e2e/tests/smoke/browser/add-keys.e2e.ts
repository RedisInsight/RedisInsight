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
import { rte } from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();

fixture `Add keys`
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add Hash Key', async t => {
        const keyName = 'hashTestKey12345qwe';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add Set Key', async t => {
        const keyName = '1111111111111111111setTestKey1234';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add List Key', async t => {
        const keyName = '22listTestKey1';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add String Key', async t => {
        const keyName = '1234567890testkestringytrtest1111';
        await t.maximizeWindow();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add ZSet Key', async t => {
        const keyName = 'ZsetTestKey1234567';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add JSON Key', async t => {
        const keyName = 'JSON1234567891';
        const keyTTL = '2147476121';
        const value = '{"name":"xyz"}';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
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
