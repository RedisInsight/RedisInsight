import { rte } from '../../../helpers/constants';
import { deleteDatabase, acceptTermsAddDatabaseOrConnectToRedisStack } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Chance } from 'chance';

const browserPage = new BrowserPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });

fixture `Add keys`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    ('Verify that user can add Hash Key', async t => {
        keyName = chance.word({ length: 10 });
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
        keyName = chance.word({ length: 10 });
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
        keyName = chance.word({ length: 10 });
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
        keyName = chance.word({ length: 10 });
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
        keyName = chance.word({ length: 10 });
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
        keyName = chance.word({ length: 10 });
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
